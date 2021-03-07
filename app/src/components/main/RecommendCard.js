import React, { useState, useEffect } from 'react';
import { user } from '../../network/user';
import { cards } from '../../network/cards'


let dining = ['Bar', 'Cafe', 'Meal delivery', 'Meal takeaway', 'Restaurant'];
let grocery = ['Bakery','Liquor Store', 'Supermarket', 'Grocery or supermarket'];
let drugstore = ['Drugstore'];
let gas = ['Gas station'];
let homeImprovement = ['Furniture store', 'Home goods store', 'electrician', 
    'hardware store', 'Plumber', 'Roofing contractor'];
let travel = ['Airport', 'Amusement park', 'Aquarium', 'Art gallery', 'Car rental', 'Light rail station', 'Parking',
    'Tourist attraction', 'Transit station', 'Travel agency', 'Zoo']

class RecommendCard {
    getCategory(googleCategory) {
        if (dining.includes(googleCategory)) {
            return "dining";
        } else if (grocery.includes(googleCategory)) {
            return 'grocery';
        } else if (drugstore.includes(googleCategory)) {
            return 'drugstore';
        } else if (gas.includes(googleCategory)) {
            return 'gas';
        } else if (homeImprovement.includes(googleCategory)) {
            return 'homeImprovement';
        } else if (travel.includes(googleCategory)) {
            return 'travel';
        } else {
            return 'others';
        }
    }

    // get user's cards ranked by category given
    async getRecCards(googleCategory, callback) {
        const userId = user.getUserId();
        let category = this.getCategory(googleCategory);
        let myCards = [];
        let tmpCardId = "";
        let tmpCardCatReward = null;
        // Get list of user's cards
        let dbCards = await user.getCards(userId);
        // For each card, get the category reward value
        let i = 0;
        console.log("google category: " + googleCategory);
        for (i = 0; i < dbCards.length; i++) {
            tmpCardId = dbCards[i].cardId;
            tmpCardInfo = await cards.getCardReward(tmpCardId, category);
            myCards.push({
                "cardId": tmpCardId,
                "cardCatReward": tmpCardInfo["reward"],
                "cardImg": tmpCardInfo["image"],
                "cardType": tmpCardInfo["type"],
                "cardCatUncoverted": tmpCardInfo["unconvertedReward"]
            });
        }
        myCards.sort((a, b) => (a.cardCatReward < b.cardCatReward ? 1 : -1))
        // console.log(myCards);
        callback(myCards);
    }

    // insert user's transaction into db
    setTransaction(storeInfo, recCard, amountSpent) {
        const userId = user.getUserId();
        user.saveTransactionToUser(
            userId,
            recCard.recCardId,
            {
                storeName: storeInfo["label"],
                address: storeInfo["vicinity"],
                storeType: storeInfo["storeType"]
            },
            amountSpent
        );
    }
}

export var recommendCard = new RecommendCard();

