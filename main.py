from flask import Flask, redirect, url_for, render_template, request, flash
import os
from werkzeug.utils import secure_filename
import pandas as pd

app = Flask(__name__)
app.secret_key = os.urandom(24)
UPLOAD_FOLDER = 'static/files'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOW_EXTENSIONS = {'csv'}
currencyTotals = {
    'CAD': 0,
    'BTC': 0,
    'ETH': 0,
}
averageCost = {
    'CAD': 0,
    'BTC': 0,
    'ETH': 0,
}

incomeGain = 0


def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOW_EXTENSIONS


@app.route("/")
def indexPage():
    return render_template("index.html")


@app.route('/', methods=['POST'])
def processTax():
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
        return render_template("processTax.html", table=table.to_html())


def parseCSV(filePath):
    df = pd.read_csv(filePath)
    df["Date"] = df["Date"].str.replace('T', ' ')
    df["Date"] = df["Date"].str.replace(r'\+00', ' UTC')
    return df.fillna("")


def peerTransfer(row):
    global incomeGain
    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        creditCurrency = row["Credit Currency"]
        totalCreditCurrency = currencyTotals[creditCurrency]

        incomeGain += credit * row["Spot Rate"]
        currentAvg = averageCost[creditCurrency]
        averageCost[creditCurrency] = (currentAvg * totalCreditCurrency) + (row["Spot Rate"] * credit) / (
                totalCreditCurrency + credit)
        currencyTotals[creditCurrency] += credit


def fiatFunding(row):
    if row["Credit/Debit"] == "credit":
        credit = row["Amount Credited"]
        currency = row["Credit Currency"]
        currencyTotals[currency] += credit


def purchaseSale(row):
    # credit
    credit = row["Amount Credited"]
    creditCurrency = row["Credit Currency"]
    totalCreditCurrency = currencyTotals[creditCurrency]
    buyPrice = row["Buy/Sell rate"]
    currentAvg = averageCost[creditCurrency]
    averageCost[creditCurrency] = (currentAvg * totalCreditCurrency) + (buyPrice * credit) / (totalCreditCurrency
                                                                                              + credit)
    currencyTotals[creditCurrency] += credit
    # debit
    debit = row["Amount Debited"]
    debitCurrency = row["Debit Currency"]
    totalDebitCurrency = currencyTotals[debitCurrency]
    sellPrice = averageCost[debitCurrency]


def cryptoCashout():
    print("cash")


def referralReward():
    print("referral Reward")


TRANSACTION_PARSE = {
    "peer transfer": peerTransfer,
    "fiat funding": fiatFunding,
    "purchase/sale": purchaseSale,
    "crypto cashout": cryptoCashout,
    "referral reward": referralReward,

}


def calculateTax(table):
    transactionType = table["Transaction Type"]
    for index, row in table.iterrows():
        TRANSACTION_PARSE.get(row["Transaction Type"], lambda x: print("Error"))(row)


if __name__ == '__main__':
    app.run(debug=True)
