from flask import Flask, request, g
import os
import re
import time
from EthScanTransactions import *
from flask_cors import CORS
pd.options.display.precision = 10
pd.set_option('display.max_colwidth', None)
app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)


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


# process income gain and capital gain using csv from shakepay, then display
@app.route('/upload', methods=['POST'])
def processTax():
    setup()
    content = request.files['file']
    g.walletAddresses = request.form['wallet']
    df = pd.read_csv(content)
    df = formatDataFrame(df)
    ethAddress = re.compile("^0x[a-fA-F0-9]{40}$")
    result = ethAddress.match(str(g.walletAddresses))
    if result:
        df = mergeEtherScan(df)
        df = sortByDate(df)
    calculateTax(df)
    print(df.head(5))
    # format and send back to frontend
    res = json.loads(df.to_json(orient='records'))
    columns = [
        {"title": 'Transaction Type', "field": 'Transaction Type'},
        {"title": 'Date', "field": 'Date'},
        {"title": 'Amount Debited', "field": 'Amount Debited'},
        {"title": 'Debit Currency', "field": 'Debit Currency'},
        {"title": 'Amount Credited', "field": 'Amount Credited'},
        {"title": 'Credit Currency', "field": 'Credit Currency'},
        {"title": 'Buy/Sell rate', "field": 'Buy/Sell rate'},
        {"title": 'Credit/Debit', "field": 'Credit/Debit'},
        {"title": 'Spot Rate', "field": 'Spot Rate'},
        {"title": 'Address', "field": 'Address'},
        {"title": 'Blockchain Transaction ID', "field": 'Blockchain Transaction ID'},
        {"title": 'Taken From', "field": 'Taken From'},
        {"title": 'Event', "field": 'Event'}
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
    dataToBeSent = {"columns": columns, "table": res, "info": info}
    return json.dumps(dataToBeSent)


@app.route('/resubmit', methods=['POST'])
def processResubmit():
    g.walletAddresses = request.form['wallet']
    columns = request.form['columns']
    data = request.form['data']
    df = pd.read_json(data)

    print(df)
    return "hello"

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
    df[["Amount Credited", "Amount Debited", "Spot Rate", "Buy/Sell rate"]] = df[
        ["Amount Credited", "Amount Debited", "Spot Rate", "Buy/Sell rate"]].applymap(decimal_from_value)

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
    if amount < 0:
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
    if row["Credit/Debit"] == "credit":
        event = "Income gain"
        credit = row["Amount Credited"]
        creditCurrency = row["Credit Currency"]
        totalCreditCurrency = getCurrencyTotals(creditCurrency)
        if row["Spot Rate"] == "":
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
    if row["Credit/Debit"] == "credit":
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
    buyPrice = row["Buy/Sell rate"]
    currentAvg = getAvgCost(creditCurrency)
    newAvg = (currentAvg * totalCreditCurrency) + (buyPrice * credit) / (totalCreditCurrency + credit)
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
            costToObtain = (1 - avgDebitPrice) / avgDebitPrice * credit + credit
        gain = credit - costToObtain
        if gain < 0:
            event = "Capital loss"
            capitalLoss += gain
            g.capitalLoss = capitalLoss
        elif gain >= 0:
            event = "Capital gain"
            capitalGain += gain
            g.capitalGain = capitalGain
    if getCurrencyTotals(debitCurrency) == 0:
        setAvgCost(debitCurrency, 0)
    g.capitalGain = capitalGain
    return event

# Calculate capital gain or loss when transferring crypto outside of shakepay
def cryptoCashout(row):
    event = ""
    address = row["Address"]
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
    if address != g.walletAddresses:
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

    if getCurrencyTotals(debitCurrency) == 0:
        setAvgCost(debitCurrency, 0)

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

def walletReceive(row):
    event = ""
    credit = Decimal(row["Amount Credited"])
    averagePrice = g.avgETH
    total = g.totalETH
    sendTransactions = g.send
    # check transaction was by user
    if sendTransactions:
        event = "Internal transfer"
        for sendRow in sendTransactions:
            debit = Decimal(sendRow["Amount Debited"])
            if credit.compare(debit):
                del sendTransactions[0]
        g.send = sendTransactions
    # was not sent by user
    else:
        event = "Income gain"
        price = Decimal(row["Spot Rate"])
        income = int(price) * credit
        averagePrice = (averagePrice * total + income) / (credit + total)
        total = total + credit
        g.totalETH = total
        g.avgETH = averagePrice
        g.incomeGain += income
    return event



def walletSend(row):
    event = "Internal transfer"
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
}


def calculateTax(table):
    for index, row in table.iterrows():
        event = TRANSACTION_PARSE.get(row["Transaction Type"], lambda x: print("Error"))(row)
        table.at[index, "Event"] = event

def mergeEtherScan(shakepayData):
    etherScanData = getEthTransactions_ShakepayFormat(g.walletAddresses, 'ethereum', 'CAD')
    mergedData = pd.concat([shakepayData, etherScanData],ignore_index = True)
    shakepayData = mergedData
    return shakepayData


def decimal_from_value(value):
    if value != "":
        return Decimal(value)
    return ""
