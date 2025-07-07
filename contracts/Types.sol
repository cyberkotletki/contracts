// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

enum PaymentType {Donate, Withdraw}

struct UserBank{
    User user;
    uint currentBalance;
}

struct User {
    string uuid;
    string name;    
    Payment[] payments;
    Wish[] wishes;
    string[] topics;
}

struct Payment {
    string uuid;
    PaymentUserData paymentUserData;
    PaymentInfo paymentInfo;
    uint amount;
}

struct Wish {
    uint id;
    uint currentBalance;
    uint cost;
    string name;
    string link;
    string description;
    string image;
}

struct PaymentUserData {
    bool isAnonymous;
    string userName;
    string messageText;
}

struct PaymentInfo{
    uint date;
    string toUUID;
    uint wishId;
    address toAddress;
    PaymentType paymentType;
}