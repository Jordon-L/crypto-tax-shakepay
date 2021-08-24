from flask import Flask, request, g
from app import app
import json
import re
import time
import sys
from api.EthScanTransactions import *
from flask_cors import CORS
pd.options.display.precision = 10
pd.set_option('display.max_colwidth', None)
CORS(app)

errorEpsilon = sys.float_info.epsilon

def setup():
    g.totalCAD = 0
    g.totalBTC = 0
    g.totalETH = 0
    g.avgCAD = 0
    g.avgBTC = 0
    g.avgETH = 0
    g.incomeGain = 0
    g.capitalGain = 0
    g.capitalLoss = 0
    g.bankTransferOutCAD = 0
    g.CADSent = 0
    g.CADReceived = 0
    g.send = []
    g.feesInCAD = 0


# process income gain and capital gain using csv from shakepay, then display
@app.route('/upload', methods=['POST'])
def processTax():
    setup()
    content = request.files['file']
    g.walletAddresses = request.form['wallet']
    df = pd.read_csv(content)
    df = formatDataFrame(df)
    dfTax = pd.DataFrame(columns=['Number', 'Name of fund/corp. and class of shares',
                                  '(1) Year of acquisition',
                                  '(2) Proceeds of disposition',
                                  '(3) Adjusted cost base',
                                  '(4) Outlays and expenses (from dispositions)',
                                  '(5) Gain (or loss) (column 2 minus columns 3 and 4)'])
    addresses = g.walletAddresses.split(",")
    g.walletAddresses = addresses
    ethAddress = re.compile("^0x[a-fA-F0-9]{40}$")
    # pull data from etherscan and merge data from shakepay
    for address in addresses:
        result = ethAddress.match(address)
        if result:
            df = mergeEtherScan(df,address)
            df = sortByDate(df)
        time.sleep(1)  # delay so etherscan api does not exceed limit
    df, dfTax = calculateTax(df, dfTax)
    df['id'] = df.index + 1
    # convert back to readable dates
    df['Date'] = pd.to_datetime(df['Date'], unit='s')
    df['Date'] = df['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
    # format and send back to frontend
    res = json.loads(df.to_json(orient='records'))
    tax = json.loads(dfTax.to_json(orient='records'))
    columns = [
        {"title": 'Transaction Type', "field": 'Transaction Type'},
        {"title": 'Date', "field": 'Date'},
        {"title": 'Amount Debited', "field": 'Amount Debited'},
        {"title": 'Amount Credited', "field": 'Amount Credited'},
        {"title": 'Buy / Sell Rate', "field": 'Buy / Sell Rate'},
        {"title": 'Direction', "field": 'Direction'},
        {"title": 'Spot Rate', "field": 'Spot Rate'},
        {"title": 'Taken From', "field": 'Taken From'},
        {"title": 'Event', "field": 'Event'},
        {"title": 'Source / Destination', "field": 'Source / Destination'}
        ]
    taxColumns = [
        {"title": 'Number', "field": 'Number'},
        {"title": 'Name',  "field": 'Name of fund/corp. and class of shares'},
        {"title": 'Year of acquisition', "field": '(1) Year of acquisition'},
        {"title": 'Proceeds of disposition', "field": '(2) Proceeds of disposition'},
        {"title": 'Adjusted cost base', "field": '(3) Adjusted cost base'},
        {"title": 'Outlays and expenses', "field": '(4) Outlays and expenses (from dispositions)'},
        {"title": 'Gain', "field": '(5) Gain (or loss) (column 2 minus columns 3 and 4)'}
    ]
    info = {
        "incomeGain": str(g.incomeGain),
        "capitalGain": str(g.capitalGain),
        "capitalLoss": str(g.capitalLoss),
        "totalBTC": str(g.totalBTC),
        "totalETH": str(g.totalETH),
        "CADSent": str(g.CADSent),
        "CADReceived": str(g.CADReceived),
        "totalCAD": str(g.totalCAD),
        "avgBTC": str(g.avgBTC),
        "avgETH": str(g.avgETH)
    }


    dataToBeSent = {"columns": columns, "table": res, "info": info, "taxTable": tax, "taxColumns": taxColumns }
    return json.dumps(dataToBeSent)

def sortByDate(df):
    df.sort_values(by=['Date'], inplace=True, ignore_index=True)
    return df

def formatDataFrame(df):
    df = df.fillna("")
    df["Date"] = df["Date"].str[:-3]
    df["Date"] = pd.to_datetime(df["Date"])
    df["Date"] = (df["Date"] - pd.Timestamp("1970-01-01")) // pd.Timedelta("1s")
    df["Taken From"] = "Shakepay"
    df["Event"] = ""
    df[["Amount Credited", "Amount Debited", "Spot Rate", "Buy / Sell Rate"]] = df[
        ["Amount Credited", "Amount Debited", "Spot Rate", "Buy / Sell Rate"]].applymap(decimal_from_value)

    return df.fillna("")


# Get amount of a currency in the user's possession
def getCurrencyTotals(currency):
    if currency == "CAD":
        return g.totalCAD
    elif currency == "BTC":
        return g.totalBTC
    elif currency == "ETH":
        return g.totalETH
    return 0


# Set amount of a currency in the user's possession
def setCurrencyTotals(currency, amount):
    if amount < errorEpsilon:
        amount = 0
    if currency == "CAD":
        g.totalCAD = amount
    elif currency == "BTC":
        g.totalBTC = amount
    elif currency == "ETH":
        g.totalETH = amount


# Get the average cost of a currency in the user's possession
def getAvgCost(currency):
    if currency == "CAD":
        return g.avgCAD
    elif currency == "BTC":
        return g.avgBTC
    elif currency == "ETH":
        return g.avgETH
    return 0


# Set the average cost of a currency in the user's possession
def setAvgCost(currency, amount):
    if currency == "CAD":
        g.avgCAD = amount
    elif currency == "BTC":
        g.avgBTC = amount
    elif currency == "ETH":
        g.avgETH = amount


# Calculate the income gain from receiving a currency and adjust the average cost
def peerTransfer(row):
    event = ""
    incomeGain = g.incomeGain
    # if canadian dollar is received or sent out in shakepay app
    if row["Credit Currency"] == 'CAD':
        event = "Transfer Fiat"
        g.CADReceived += row["Amount Credited"]
        g.totalCAD += row["Amount Credited"]
        return event
    elif row["Debit Currency"] == 'CAD':
        event = "Transfer Fiat"
        g.CADSent += row["Amount Debited"]
        g.totalCAD -= row["Amount Debited"]
        return event
    # crypto is sent out and receive in shakepay app
    if row["Direction"] == "credit":
        event = "Income gain"
        credit = row["Amount Credited"]
        creditCurrency = row["Credit Currency"]
        totalCreditCurrency = getCurrencyTotals(creditCurrency)
        if row["Spot Rate"] == "":
            #if spot rate is empty for some reason. continue runnning code
            incomeGain += 0
        else:
            incomeGain += credit * row["Spot Rate"]
            currentAvg = getAvgCost(creditCurrency)
            newAvg = (currentAvg * totalCreditCurrency + row["Spot Rate"] * credit) / (
                totalCreditCurrency + credit)
            setAvgCost(creditCurrency, newAvg)
        setCurrencyTotals(creditCurrency, totalCreditCurrency + credit)

    g.incomeGain = incomeGain
    return event

# increase amount of fiat the user's possession
def fiatFunding(row):
    event = "Internal transfer"
    if row["Direction"] == "credit":
        credit = row["Amount Credited"]
        currency = row["Credit Currency"]
        if currency == "CAD":
            totalCurrency = getCurrencyTotals(currency)
            setCurrencyTotals(currency, totalCurrency + credit)
    return event

# Calculate the capital gain and loss when a transaction exchanges a currency for a different currency
def purchaseSale(row):
    event = "Purchase Crypto"
    capitalGain = g.capitalGain
    capitalLoss = g.capitalLoss
    # credit
    credit = row["Amount Credited"]
    creditCurrency = row["Credit Currency"]
    totalCreditCurrency = getCurrencyTotals(creditCurrency)
    buyPrice = row["Buy / Sell Rate"]
    currentAvg = getAvgCost(creditCurrency)
    newAvg = (currentAvg * totalCreditCurrency + buyPrice * credit) / (totalCreditCurrency + credit)
    setAvgCost(creditCurrency, newAvg)
    setCurrencyTotals(creditCurrency, totalCreditCurrency + credit)
    # debit
    debit = row["Amount Debited"]
    debitCurrency = row["Debit Currency"]
    totalDebitCurrency = getCurrencyTotals(debitCurrency)
    avgDebitPrice = getAvgCost(debitCurrency)
    setCurrencyTotals(debitCurrency, totalDebitCurrency - debit)
    # the sale of crypto to fiat (taxable event)
    if creditCurrency == "CAD":
        costToObtain = 0
        if avgDebitPrice != 0:
            costToObtain = avgDebitPrice * debit
        gain = credit - costToObtain
        if gain < 0:
            event = "Capital loss"
            capitalLoss += gain
            g.capitalLoss = capitalLoss
        elif gain >= 0:
            event = "Capital gain"
            capitalGain += gain
            g.capitalGain = capitalGain

    g.capitalGain = capitalGain
    return event

# Calculate capital gain or loss when transferring crypto outside of shakepay
def cryptoCashout(row):
    event = ""
    address = row["Source / Destination"]
    capitalGain = g.capitalGain
    capitalLoss = g.capitalLoss
    debit = row["Amount Debited"]
    debitCurrency = row["Debit Currency"]
    totalDebitCurrency = getCurrencyTotals(debitCurrency)
    avgDebitPrice = getAvgCost(debitCurrency)
    setCurrencyTotals(debitCurrency, totalDebitCurrency - debit)
    salePrice = row["Spot Rate"]
    costToObtain = 0
    credit = salePrice * debit
    if address not in g.walletAddresses:
        if avgDebitPrice != 0:
            costToObtain = avgDebitPrice * debit
        gain = credit - costToObtain
        if gain < 0:
            event = "Capital loss"
            capitalLoss += gain
            g.capitalLoss = capitalLoss
        elif gain >= 0:
            event = "Capital gain"
            capitalGain += gain
            g.capitalGain = capitalGain
    else:
        event = "Internal transfer"
        g.send.append(row)

    return event


# Calculate income gain from referral rewards
def referralReward(row):
    event = "Income gain"
    incomeGain = g.incomeGain
    credit = row["Amount Credited"]
    creditCurrency = row["Credit Currency"]
    if creditCurrency == "CAD":
        g.incomeGain = incomeGain + credit
    return event

def cryptoFunding(row):
    event = "Internal transfer"

    credit = row["Amount Credited"]
    creditCurrency = row["Credit Currency"]
    totalCreditCurrency = getCurrencyTotals(creditCurrency)
    setCurrencyTotals(creditCurrency, totalCreditCurrency + credit)

    return event


# store the amount of fiat transfer to a bank
def fiatCashout(row):
    event = "Internal transfer"
    bankTransfer = g.bankTransferOutCAD
    debit = row["Amount Debited"]
    debitCurrency = row["Debit Currency"]
    if debitCurrency == "CAD":
        bankTransfer += debit
    g.bankTransferOutCAD = bankTransfer
    return event
# for etherscan data
def walletReceive(row):
    event = ""
    credit = Decimal(row["Amount Credited"])
    averagePrice = g.avgETH
    creditCurrency = row["Credit Currency"]
    total = getCurrencyTotals(creditCurrency)
    sendTransactions = g.send
    # check transaction was by user
    if sendTransactions:
        event = "Internal transfer"
        for sendRow in sendTransactions:
            debit = Decimal(sendRow["Amount Debited"])
            if credit.compare(debit):
                del sendTransactions[0]
        g.send = sendTransactions
        total = total + credit
        g.totalETH = total
    # was not sent by user
    else:
        event = "Income gain"
        price = Decimal(row["Spot Rate"])
        income = int(price) * credit
        averagePrice = (averagePrice * total + income) / (credit + total)
        total = total + credit
        setCurrencyTotals(creditCurrency, total)
        setAvgCost(creditCurrency, averagePrice)
        g.incomeGain += income
    return event


# for etherscan data
def walletSend(row):
    event = "Internal transfer"
    debit = Decimal(row["Amount Debited"])
    fees = row['fees']
    averagePrice = g.avgETH
    total = g.totalETH
    total = total - debit - fees
    g.feesInCAD += fees * row["Spot Rate"]
    setCurrencyTotals(row["Debit Currency"], total)
    return event


TRANSACTION_PARSE = {
    "peer transfer": peerTransfer,
    "fiat funding": fiatFunding,
    "purchase/sale": purchaseSale,
    "crypto cashout": cryptoCashout,
    "referral reward": referralReward,
    "crypto funding": cryptoFunding,
    "fiat cashout": fiatCashout,
    "Receive": walletReceive,
    "Send": walletSend,
    "shakingsats": peerTransfer,
    "other": referralReward
}


def calculateTax(table, tableTax):
    for index, row in table.iterrows():
        event = TRANSACTION_PARSE.get(row["Transaction Type"], lambda x: print("Error"))(row)
        table.at[index, "Event"] = event
        # tax table
        if event == "Capital gain" or event == "Capital loss":
            debitCurrency = row["Debit Currency"]
            number = round(row["Amount Debited"], 4)
            name = "Error"
            year = "2020"
            # credit being empty means user transferred crypto to an account that is not theirs
            if row["Amount Credited"] == "":
                sold = round(row["Spot Rate"] * row["Amount Debited"], 4)
            else:
                sold = round(row["Amount Credited"], 4)
            price = round(getAvgCost(debitCurrency) * row["Amount Debited"], 4)
            fees = 0
            if getCurrencyTotals(debitCurrency) == 0:
                setAvgCost(debitCurrency, 0)
            if row["Debit Currency"] == "ETH":
                name = "Ethereum"
                accumulatedFees = g.feesInCAD
                fees = accumulatedFees * (row["Amount Debited"]/(row["Amount Debited"] + g.totalETH))
                fees = round(fees, 4)
                g.feesInCAD = accumulatedFees - fees
            elif row["Debit Currency"] == "BTC":
                name = "Bitcoin"
            tableTax = tableTax.append({'Number': number, 'Name of fund/corp. and class of shares' : name,
                                        '(1) Year of acquisition': year,
                                        '(2) Proceeds of disposition': sold,
                                        '(3) Adjusted cost base': price,
                                        '(4) Outlays and expenses (from dispositions)': fees,
                                        '(5) Gain (or loss) (column 2 minus columns 3 and 4)': sold-price-fees}, ignore_index=True)
        # reformatting of data table
        if not isinstance(row["Amount Credited"], str):
            table.at[index, "Amount Credited"] = "+" + str(round(row["Amount Credited"], 4)) + " " + str(row["Credit Currency"])
        if not isinstance(row["Amount Debited"], str):
            if isinstance(row["Event"], str) != "Internal Transfer":
                table.at[index, "Amount Debited"] = "-" + str(round(row["Amount Debited"], 4)) + " " + str(row["Debit Currency"])

    if "fees" in table.columns:
        table.drop(columns=["Credit Currency", "Debit Currency", "Blockchain Transaction ID", "fees"], axis=1,
                   inplace=True)
    else:
        table.drop(columns=["Credit Currency", "Debit Currency", "Blockchain Transaction ID"], axis=1,
                   inplace=True)
    pd.options.display.max_columns = None
    pd.options.display.max_rows = None
    return table, tableTax

def mergeEtherScan(shakepayData,address):
    etherScanData = getEthTransactions_ShakepayFormat(address, 'ethereum', 'CAD')
    mergedData = pd.concat([shakepayData, etherScanData], ignore_index=True)
    shakepayData = mergedData
    return shakepayData


def decimal_from_value(value):
    if value != "":
        return Decimal(value)
    return ""
