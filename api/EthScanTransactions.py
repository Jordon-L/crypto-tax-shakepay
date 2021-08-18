import os
from decimal import Decimal
from etherscan import Etherscan
import pandas as pd
from pycoingecko import CoinGeckoAPI
from datetime import datetime
cg = CoinGeckoAPI()

apiKey = "1"

def getEthTransactions(walletAddress):
    eth = Etherscan(apiKey)

    transactions = eth.get_normal_txs_by_address(walletAddress,0,999999999,"asc")
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
    df = getEthTransactions(walletAddress)
    dailyPrices = getCoinGeckoPrices(currency, fiat)
    dfShakepay = pd.DataFrame(columns=
                              ["Transaction Type", "Date", "Amount Debited", "Debit Currency", "Amount Credited",
                               "Credit Currency", "Buy / Sell Rate", "Direction", "Spot Rate", "Source / Destination",
                               "Blockchain Transaction ID", "Taken From", "Event"])
    for index, row in df.iterrows():
        # take the day the transaction occurs and get the price of the ethereum in canadian dollars on that day
        transactionTime = int(row["timeStamp"])
        dateOfTransaction = datetime.utcfromtimestamp(transactionTime).strftime('%d-%m-%Y')
        price = 0
        price = getCoinGeckoDailyPrices(dateOfTransaction, dailyPrices)
        #convert gwei to eth
        value = Decimal(row['value']) / Decimal('1000000000000000000')
        # if move eth out of wallet
        if row["from"].lower() == walletAddress.lower():
            dfShakepay = dfShakepay.append({"Transaction Type": "Send", "Date": transactionTime,
                                            "Amount Debited": value, "Debit Currency": "ETH", "Direction": "debit",
                                            "Spot Rate": price, "Source / Destination": row["to"], "Taken From": "Etherscan", "Event": "",
                                            }, ignore_index=True,)
        else:
            dfShakepay = dfShakepay.append({"Transaction Type": "Receive", "Date": transactionTime,
                                            "Amount Credited": value, "Credit Currency": "ETH",
                                            "Direction": "credit", "Spot Rate": price, "Source / Destination": row["to"], "Taken From": "Etherscan", "Event": "",
                                            }, ignore_index=True, )
    return dfShakepay.fillna("")
