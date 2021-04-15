from flask import Flask, redirect, url_for, render_template, request, flash, g
from IPython.display import HTML
import os
from werkzeug.utils import secure_filename
from EthScanTransactions import *

pd.options.display.precision = 10
pd.set_option('display.max_colwidth', None)
app = Flask(__name__)
app.secret_key = os.urandom(24)
UPLOAD_FOLDER = '/tmp'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOW_EXTENSIONS = {'csv'}


def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOW_EXTENSIONS


@app.route("/")
def indexPage():
    return render_template("index.html")


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
    g.send = []


# process income gain and capital gain using csv from shakepay, then display
@app.route('/', methods=['POST'])
def processTax():
    setup()
    # get uploaded file
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('no file part')
            return redirect(url_for('indexPage'))
        file = request.files['file']
        if file.filename == '':
            flash("No selected file")
            return redirect(url_for('indexPage'))
        if not (allowedFile(file.filename)):
            flash("only .csv files are allowed")
            return redirect(url_for('indexPage'))
        if file and allowedFile(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            # remove absolute_path when deploying and change to file_path
            absolute_path = os.path.abspath("tmp/" + filename)
            file.save(absolute_path)
            table = parseCSV(absolute_path)
            walletAddresses = request.form['wallet-address']
            g.walletAddresses = walletAddresses
            table = mergeEtherScan(table)
            calculateTax(table)
            return render_template("processTax.html", table=HTML(table.to_html(escape = False)), incomeGain=g.incomeGain,
                                   capitalGain=g.capitalGain, capitalLoss=g.capitalLoss, totalBTC=g.totalBTC,
                                   totalETH=g.totalETH, totalCAD=g.totalCAD,
                                   bankTransferOut=g.bankTransferOutCAD)


@app.route('/interventions/<action>/<item_id>', methods=['GET', 'POST'])
def deleteRow(action=None, item_id=None):
    if request.method == "POST":
        if action == 'delete':
            deleteRow.query.get(item_id)

def parseCSV(filePath):
    df = pd.read_csv(filePath, converters ={'Amount Credited':  decimal_from_value,
                                            'Amount Debited':  decimal_from_value,
                                            'Buy/Sell rate':  decimal_from_value,
                                            'Spot Rate':  decimal_from_value})
    df["Date"] = df["Date"].str[:-3]
    df["Date"] = pd.to_datetime(df["Date"])
    df["Date"] = (df["Date"] - pd.Timestamp("1970-01-01")) // pd.Timedelta("1s")
    df["Taken From"] = "Shakepay"
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
    incomeGain = g.incomeGain

    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        creditCurrency = row["Credit Currency"]
        totalCreditCurrency = getCurrencyTotals(creditCurrency)
        if row["Spot Rate"] == "":
            incomeGain += 0
        else:
            incomeGain += credit * row["Spot Rate"]
            currentAvg = getAvgCost(creditCurrency)
            newAvg = (currentAvg * totalCreditCurrency) + (row["Spot Rate"] * credit) / (
                totalCreditCurrency + credit)
            setAvgCost(creditCurrency, newAvg)
        setCurrencyTotals(creditCurrency, totalCreditCurrency + credit)

    g.incomeGain = incomeGain


# increase amount of fiat the user's possession
def fiatFunding(row):
    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        currency = row["Credit Currency"]
        if currency == "CAD":
            totalCurrency = getCurrencyTotals(currency)
            setCurrencyTotals(currency, totalCurrency + credit)


# Calculate the capital gain and loss when a transaction exchanges a currency for a different currency
def purchaseSale(row):
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
        salePrice = (1 - debit) / debit * credit + credit
        costToObtain = 0
        if avgDebitPrice != 0:
            costToObtain = (1 - avgDebitPrice) / avgDebitPrice * credit + credit
        gain = credit - costToObtain
        if gain < 0:
            capitalLoss += gain
            g.capitalLoss = capitalLoss
        elif gain >= 0:
            capitalGain += gain
            g.capitalGain = capitalGain

    g.capitalGain = capitalGain


# Calculate capital gain or loss when transferring crypto outside of shakepay
def cryptoCashout(row):
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
            capitalLoss += gain
            g.capitalLoss = capitalLoss
        elif gain >= 0:
            capitalGain += gain
            g.capitalGain = capitalGain
    else:
        g.send.append(row)


# Calculate income gain from referral rewards
def referralReward(row):
    incomeGain = g.incomeGain
    credit = row["Amount Credited"]
    creditCurrency = row["Credit Currency"]
    if creditCurrency == "CAD":
        g.incomeGain = incomeGain + credit


def cryptoFunding(row):
    return 0


# store the amount of fiat transfer to a bank
def fiatCashout(row):
    bankTransfer = g.bankTransferOutCAD
    debit = row["Amount Debited"]
    debitCurrency = row["Debit Currency"]
    if debitCurrency == "CAD":
        bankTransfer += debit
    g.bankTransferOutCAD = bankTransfer


def walletReceive(row):
    credit = Decimal(row["Amount Credited"])
    averagePrice = g.avgETH
    total = g.totalETH
    sendTransactions = g.send
    #check transaction was by user
    if sendTransactions:
        for sendRow in sendTransactions:
            debit = Decimal(sendRow["Amount Debited"])
            if credit.compare(debit):
                del sendTransactions[0]
        g.send = sendTransactions
    else:
        price = Decimal(row["Spot Rate"])
        income = int(price) * credit
        averagePrice = averagePrice * total + income / credit + total
        total = total + credit
        g.totalETH = total
        g.avgETH = averagePrice
        g.incomeGain += income

    #was not sent by user

def walletSend(row):
    print("send")

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
    transactionType = table["Transaction Type"]

    for index, row in table.iterrows():
        TRANSACTION_PARSE.get(row["Transaction Type"], lambda x: print("Error"))(row)


def mergeEtherScan(shakepayData):
    if g.walletAddresses != "":
        etherScanData = getEthTransactions_ShakepayFormat(g.walletAddresses, 'ethereum', 'CAD')
        mergedData = pd.concat([shakepayData, etherScanData])
        shakepayData = mergedData
    return shakepayData

def decimal_from_value(value):
    if value != "":
        return Decimal(value)
    return ""

if __name__ == '__main__':
    app.run()
