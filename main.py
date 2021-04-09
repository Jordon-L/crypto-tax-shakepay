from flask import Flask, redirect, url_for, render_template, request, flash, g
import os
from werkzeug.utils import secure_filename
import pandas as pd
pd.options.display.precision = 10
app = Flask(__name__)
app.secret_key = os.urandom(24)
UPLOAD_FOLDER = 'static/files'
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


@app.route('/', methods=['POST'])
def processTax():
    setup()
    # get uploaded file
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('no file part')
            return redirect(url_for('index'))
        file = request.files['file']
        if file.filename == '':
            flash("No selected file")
            return redirect(url_for('index'))
        if not (allowedFile(file.filename)):
            flash("only .csv files are allowed")
            return redirect(url_for('index'))
        if file and allowedFile(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            table = parseCSV(file_path)
            calculateTax(table)
        return render_template("processTax.html", table=table.to_html(), incomeGain = g.incomeGain,capitalGain = g.capitalGain )


def parseCSV(filePath):
    df = pd.read_csv(filePath)
    df["Date"] = df["Date"].str.replace('T', ' ')
    df["Date"] = df["Date"].str[:-3]
    return df.fillna("")

# get how much of a currency does the user have
def getCurrencyTotals(currency):
    if currency == "CAD":
        return g.totalCAD
    elif currency == "BTC":
        return g.totalBTC
    elif currency == "ETH":
        return g.totalETH
    return 0

# set much of a currency does the user have
def setCurrencyTotals(currency, amount):
    if currency == "CAD":
        g.totalCAD = amount
    elif currency == "BTC":
        g.totalBTC = amount
    elif currency == "ETH":
        g.totalETH = amount

# get the average cost of a currency
def getAvgCost(currency):
    if currency == "CAD":
        return g.avgCAD
    elif currency == "BTC":
        return g.avgBTC
    elif currency == "ETH":
        return g.avgETH
    return 0


def setAvgCost(currency, amount):
    if currency == "CAD":
        g.avgCAD = amount
    elif currency == "BTC":
         g.avgBTC = amount
    elif currency == "ETH":
        g.avgETH = amount

def peerTransfer(row):
    incomeGain = g.incomeGain

    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        creditCurrency = row["Credit Currency"]
        totalCreditCurrency = getCurrencyTotals(creditCurrency)
        if row["Spot Rate"] == "":
            incomeGain += credit * getAvgCost(creditCurrency)
        else:
            incomeGain += credit * row["Spot Rate"]
            currentAvg = getAvgCost(creditCurrency)
            newAvg = (currentAvg * totalCreditCurrency) + (row["Spot Rate"] * credit) / (
                totalCreditCurrency + credit)
            setAvgCost(creditCurrency, newAvg)
        setCurrencyTotals(creditCurrency, totalCreditCurrency + credit)

    g.incomeGain = incomeGain

def fiatFunding(row):
    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        currency = row["Credit Currency"]
        totalCurrency = getCurrencyTotals(currency)
        setCurrencyTotals(currency, totalCurrency + credit)


def purchaseSale(row):
    capitalGain = g.capitalGain
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
        capitalGain += gain

    g.capitalGain = capitalGain

def cryptoCashout(row):
    print("cash")



def referralReward(row):
    print("referral Reward")


def cryptoFunding(row):
    print("crypto funding")


def fiatCashout(row):
    print("fiat cashout")


TRANSACTION_PARSE = {
    "peer transfer": peerTransfer,
    "fiat funding": fiatFunding,
    "purchase/sale": purchaseSale,
    "crypto cashout": cryptoCashout,
    "referral reward": referralReward,
    "crypto funding": cryptoFunding,
    "fiat cashout": fiatCashout,
}


def calculateTax(table):
    transactionType = table["Transaction Type"]
    for index, row in table.iterrows():
        TRANSACTION_PARSE.get(row["Transaction Type"], lambda x: print("Error"))(row)


if __name__ == '__main__':
    app.run(debug=True)
