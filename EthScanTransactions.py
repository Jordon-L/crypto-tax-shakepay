from decimal import Decimal
from etherscan import Etherscan
import pandas as pd
import json
from pycoingecko import CoinGeckoAPI
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


def getCoinGeckoDailyPrices(currency, date):
    price = cg.get_coin_history_by_id(currency, date)
    price = price["market_data"]["current_price"]["cad"]
    return price


def getEthTransactions_ShakepayFormat(walletAddress, currency, fiat):
    walletAddress = '0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119'
    currency = "ethereum"
    fiat = "CAD"
    df = getEthTransactions()
    df["timeStamp"] = pd.to_datetime(df["timeStamp"] , unit='s')
    dfShakepay = pd.DataFrame(columns=
                              ["Transaction Type", "Date", "Amount Debited", "Debit Currency", "Amount Credited",
                               "Credit Currency", "Buy/Sell rate", "Credit/Debit", "Spot Rate", "Address",
                               "Blockchain Transaction ID", "Taken from"])
    for index, row in df.iterrows():
        # take the day the transaction occurs and get the price of the ethereum in canadian dollars on that day
        transactionTime = row["timeStamp"]
        dateOfTransaction = transactionTime.strftime('%d-%m-%Y')
        price = getCoinGeckoDailyPrices(currency, dateOfTransaction)

        #convert gwei to eth

        value = Decimal(row['value']) / Decimal('1000000000000000000')
        # if move eth out of wallet
        newRow = {}
        if row["from"].lower() == walletAddress.lower():
            dfShakepay = dfShakepay.append({"Transaction Type": "Receive", "Date": transactionTime,
                                            "Amount Debited": value, "Debit Currency": "ETH", "Credit/Debit": "debit",
                                            "Spot Rate": price, "Address": row["to"], "Taken from": "Etherscan"}, ignore_index=True,)
        else:
            dfShakepay = dfShakepay.append({"Transaction Type": "Send", "Date": transactionTime,
                                            "Amount Debited": value, "Debit Currency": "ETH", "Credit/Debit": "credit",
                                            "Spot Rate": price, "Taken from": "Etherscan"
                                            }, ignore_index=True, )
    return dfShakepay


if __name__ == '__main__':
    getEthTransactions_ShakepayFormat('0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119', 'ethereum', 'CAD')
