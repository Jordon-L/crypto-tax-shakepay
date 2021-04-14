from etherscan import Etherscan
import pandas as pd
import json


def getEthTransactions():
    with open('api_key.json', mode='r') as key_file:
        key = json.loads(key_file.read())['key']

    eth = Etherscan(key)

    address = '0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119'

    transactions = eth.get_normal_txs_by_address(address,0,999999999,"asc")
    df = pd.json_normalize(transactions)
    df.drop(df.columns[[0,2,3,4,11,12,13,14,15,16,17]], axis=1, inplace=True)
    return df


def getEthTransactions_ShakepayFormat(walletAddress):
    walletAddress = '0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119'
    df = getEthTransactions()
    df["timeStamp"] = pd.to_datetime(df["timeStamp"] , unit='s')
    dfShakepay = pd.DataFrame(columns=
                              ["Transaction Type","Date","Amount Debited","Debit Currency","Amount Credited","Credit Currency","Buy/Sell rate","Credit/Debit","Spot Rate","Address","Blockchain Transaction ID"])
    for index, row in df.iterrows():
        # if move eth out of wallet
        if row["from"] == walletAddress:
            newRow = {"Transaction Type": "Send" ,"Date": row["timeStamp"], "Amount Debited": 0, "Debit Currency": "ETH"}

    print(dfShakepay)


if __name__ == '__main__':
    getEthTransactions_ShakepayFormat('0xeD65e2473CcB85f50377e1Ea78FdaD8D47479119')
