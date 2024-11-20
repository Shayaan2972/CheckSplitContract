# Check Split Contract

## Purpose

This **Check Spliter Contract** is designed to split a bill among multiple people using Ethereum. It eliminates any hustle and allows for a quick and transparent deal. This contract allows:

- Participants to contribute to the contract
- Withdraw (if necessary).
- The remaining goes to the owner of the contract.
- Makes sure no one pays twice or overpays.
- Makes sure everything is transparent by seeing how much each person paid.

This contract is ideal for people at restaturants, on trips, and events where quick, simple, efficent and trasnparent way is needed to handle splitting the bill.

# Group Members
| Name           | GitHub Handle       | Email Address        |
|----------------|---------------------|----------------------|
| Shayaan Mohammed | @Shayaan2972     | Shayaanuddin.Mohammed45@myhunter.cuny.edu |
| Abdullah Al Razee| @   |  |
| Marwan Kabir     | @MarwanKabir     | marwan.kabir06@myhunter.cuny.edu |
| Edison Freire    | @  | edisonfreire49@myhunter.cuny.edu|
| Karim Elshabassy | @KarimE146   | karim.elshabassy53@myhunter.cuny.edu |

## Events

**ContributionMade**
- Shows when someone pays their share
- Records:
 - Who paid (by address)
 - How much they paid

**EtherSplit**
- Shows when bill is first divided
- Records:
 - Total bill amount
 - Number of people splitting
 - Cost per person

**Withdrawal**
- Shows when someone takes out money
- Records:
 - Who withdrew (by address)
 - How much they took out

## Functions

**registerParticipant**
- Adds someone to the bill split
- Parameters: Their address

**initializeBill**
- Starts a new bill
- Parameters: Total bill amount

**withdraw**
- Takes out your share
- Parameters: Amount to withdraw

**contribute**
- Pays your share
- Parameters: Amount to pay

**transferRemaining**
- Sends leftover money to owner
- Parameters: None
