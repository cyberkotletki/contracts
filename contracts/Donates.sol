// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

    import "./Types.sol";

error ArrayIsEmpty(string arrName);
error Alreadyexists();
error CantBeEmpty();

contract Donates {
    address payable public owner; 

    //CONSTANTS
    uint public K;
    uint constant public SCALE = 1000;
    uint constant public MINIMAL_TRANSFER_COST = 3888342360768 wei; //~10 cents

    //OTHER VARIABLES
    mapping(address => UserBank) public users;
    uint private ownerBalance;

    //EVENTS
    event UserCreated(string indexed uuid, string name);
    event PaymentCredited(string indexed streamerUUid, Payment payment, PaymentType indexed paymentType);

    //wish events
    event wishAdded(string indexed userUUID, uint wishId, uint price);
    event WishCompleted(string indexed userUUID , uint wishid, uint price);
    event WishDeleted(string indexed userUUID, uint wishid, uint accumulatedAmount);

    // event CommissionChanged(uint currentComission); if we want to add dynamic comission changing


    constructor(uint k) {
        require(k != 0 && k < 10, "K can't be equal to 0 or more than 10");
        owner = payable(msg.sender);
        ownerBalance = 0;
        K = k*10;
    }


    //EXTERNAL FUNCTIONS

    //USER FUNCTIONS

    //just a user registration
    function RegisterUser(string memory name, string memory uuid, string[] memory topics) external {
        require(bytes(name).length > 0, "name can't be empty");
        Wish[] memory wishes;
        Payment[] memory payments;
        
        UserBank memory user = UserBank({
            user: User({
                name: name,
                uuid: uuid,
                topics: topics,
                wishes: wishes,
                payments: payments
            }),
            currentBalance: 0
        });
        users[msg.sender] = user;
        emit UserCreated(uuid, user.user.name);
    }

    //donate from User/anonymous -> User (specified wish)
    function Donate(string memory uuid, PaymentUserData memory pud, PaymentInfo memory pi) external payable {
        require(bytes(uuid).length > 0, "uuid can't be null");
        require(msg.value >= MINIMAL_TRANSFER_COST, "donate must be more than 10 cent");

         Payment memory payment = Payment({
            uuid: uuid,
            paymentUserData: pud,
            paymentInfo: PaymentInfo({
                date: block.timestamp,
                fromUUID: pi.fromUUID,
                toUUID: pi.toUUID,
                wishId: pi.wishId,
                toAddress: pi.toAddress,
                paymentType: PaymentType.Donate
            }),
            amount: msg.value,
            transferedToUserAmount: 0
        });

        uint transferedToUserAmount = payAndTakeCommission(payable(payment.paymentInfo.toAddress), msg.value);
        payment.transferedToUserAmount = transferedToUserAmount;

        emit PaymentCredited(payment.paymentInfo.toUUID, payment, PaymentType.Donate);  
    }


    //withdraw for the Users, don't charge a commission
    function Withdraw(string memory uuid, string memory userUUID, uint amount) external {
        require(users[msg.sender].currentBalance >= amount);
        users[msg.sender].currentBalance -= amount;

        (bool send, ) = payable(msg.sender).call{value: amount}("");
        assert(send);

        Payment memory payment = Payment({
            uuid: uuid,
            paymentInfo: PaymentInfo({
                date: block.timestamp,
                fromUUID: userUUID,
                toUUID: users[msg.sender].user.uuid,
                wishId: 0,
                toAddress: msg.sender,
                paymentType: PaymentType.Withdraw
            }),
            paymentUserData: PaymentUserData({
                userName: users[msg.sender].user.name,
                messageText: ""
            }),
            amount: amount,
            transferedToUserAmount: amount
        });

        emit PaymentCredited(users[msg.sender].user.uuid, payment, payment.paymentInfo.paymentType);
    }


    //just adding a wish to a user
    function AddWish(Wish memory wish) external {
        require(wish.price > 0, "cost must be more than zero");
        require(wish.completed == false, "can't publish completed wish");

        //check if wish with this ID already exists
        bool exist = false;
        Wish[] storage arr = users[msg.sender].user.wishes;
        for (uint i = 0; i < arr.length; i++){
            if (arr[i].id == wish.id){
                exist = true;
                break;
            }
        }
        require(!exist, Alreadyexists());


        users[msg.sender].user.wishes.push(wish);
        emit wishAdded(wish.userUUID, wish.id, wish.price);
    }


    //if remove == true, removes wish from the use, else it just mark as finished
    function CompleteOrRemoveWish(address useraddr, uint wishId, bool remove) external {
        Wish[] storage arr = users[useraddr].user.wishes;
        require(arr.length > 0, ArrayIsEmpty('wishes'));
        
        for (uint i = 0; i < arr.length; i++){
            if (arr[i].id == wishId){
                
                if (remove){
                    uint currentBalance = arr[i].currentBalance;
                    arr[i] = arr[arr.length-1];
                    arr.pop();
                    
                    emit WishCompleted(users[useraddr].user.uuid, wishId, currentBalance); 
                    return;
                } 
                require(!arr[i].completed, "already completed");
                
                uint price = arr[i].price;
                arr[i].completed = true;
                 emit WishCompleted(users[useraddr].user.uuid, wishId, price); 
                return;
            }
        } 
    }


    function ChangeName(string memory newName) external{
        require(bytes(newName).length > 0, CantBeEmpty());
        users[msg.sender].user.name = newName;
    }


    

    //OWNER FUNCTIONS
    // function ChangeCommission(uint commission) external {
    //     require(msg.sender == owner, "u're not owner!");
    //     require(commission < 10, "commission can't be more than 10%");
    //     K = commission * 10;
    //     emit CommissionChanged(commission);
    // }



    //INTERNAL FUNCTIONS


    // returns the amount of ETH, that user gets
    function payAndTakeCommission(address payable addr, uint amount) internal returns(uint) {
        uint commission = (amount * K) / SCALE;
        ownerBalance+=commission;

        (bool send, ) = addr.call{value: amount-commission}(""); 
        assert(send);

        return amount - commission;
    }    
}