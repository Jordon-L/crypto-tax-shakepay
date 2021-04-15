from decimal import Decimal
from etherscan import Etherscan
import pandas as pd
import json
from pycoingecko import CoinGeckoAPI
from datetime import datetime
cg = CoinGeckoAPI()

def getEthTransactions():
    with open('api_key.json', mode='r') as key_file:
        key = json.loads(key_file.read())['key']

    eth = Etherscan(key)

    address = '0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119'

    transactions = eth.get_normal_txs_by_address(address,0,999999999,"asc")
    df = pd.json_normalize(transactions)
    df.drop(df.columns[[0,2,3,4,11,12,13,14,15,16,17]], axis=1, inplace=True)
    return df


def getCoinGeckoPrices(currency, fiat):
    data = cg.get_coin_market_chart_by_id("ethereum", "CAD", "max")
    dailyPrices = {}
    for time, price in data["prices"]:
        time = time / 1000
        date = datetime.utcfromtimestamp(time).strftime('%d-%m-%Y')
        dailyPrices[date] = price
    return dailyPrices


def getCoinGeckoDailyPrices(date, dailyPrices):
    price = dailyPrices.get(date, 0)
    return price


def getEthTransactions_ShakepayFormat(walletAddress, currency, fiat):
    df = getEthTransactions()
    dailyPrices = getCoinGeckoPrices(currency, fiat)
    dfShakepay = pd.DataFrame(columns=
                              ["Transaction Type", "Date", "Amount Debited", "Debit Currency", "Amount Credited",
                               "Credit Currency", "Buy/Sell rate", "Credit/Debit", "Spot Rate", "Address",
                               "Blockchain Transaction ID", "Taken From"])
    for index, row in df.iterrows():
        # take the day the transaction occurs and get the price of the ethereum in canadian dollars on that day
        transactionTime = int(row["timeStamp"])
        dateOfTransaction = datetime.utcfromtimestamp(transactionTime).strftime('%d-%m-%Y')
        print(dateOfTransaction)
        price = 0
        price = getCoinGeckoDailyPrices(dateOfTransaction, dailyPrices)
        #convert gwei to eth
        value = Decimal(row['value']) / Decimal('1000000000000000000')
        # if move eth out of wallet
        newRow = {}
        if row["from"].lower() == walletAddress.lower():
            dfShakepay = dfShakepay.append({"Transaction Type": "Receive", "Date": transactionTime,
                                            "Amount Debited": value, "Debit Currency": "ETH", "Credit/Debit": "debit",
                                            "Spot Rate": price, "Address": row["to"], "Taken From": "Etherscan"}, ignore_index=True,)
        else:
            dfShakepay = dfShakepay.append({"Transaction Type": "Send", "Date": transactionTime,
                                            "Amount Debited": value, "Debit Currency": "ETH", "Credit/Debit": "credit",
                                            "Spot Rate": price, "Taken From": "Etherscan"
                                            }, ignore_index=True, )
    return dfShakepay


if __name__ == '__main__':
    getEthTransactions_ShakepayFormat('0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119', 'ethereum', 'CAD')
