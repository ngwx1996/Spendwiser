import { appBackend } from './backend';

/**
 * A user class that peforms user database options
 */
class userClass { 
    /**
     * Checks if the user is currently in the "users" database. If not  
     * in the database, registers the user. Returns the user id
     */
    getUserId() { 
        var userId = appBackend.getUserID(); 
        if (userId == null) { 
            // user is not using a login, store all data locally?
            userId = "test"; // TODO test is temporary
        } else {
            appBackend.dbDoesDocExist("users." + userId, (docExists) => {
                if (!docExists) {
                    this.addUser(userId);
                }
            });
        }
        return userId;
    }

    /**
     * Adds a user to the card database with inital date added
     * 
     * @param {String} userId - the user's id after logged in 
     */
    addUser(userId) { 
        var date = new Date();

        appBackend.dbSet("users." + userId, { 
            dateCreated: date
            // TODO: maybe add name and email here?
        }, (id) => { 
            console.log(id);
        });
    }

    /**
     * Gets the cards associated with a user id
     * @param {string} userId - The User Id
     */
    async getCards(userId) { 
        return new Promise((resolve, reject) => { 
            appBackend.dbGetSubCollections("users." + userId + ".cards", (data) => {
                resolve(data);
            })
        })
    }

    /**
     *  Deletes a card from the user's database 
     * @param {*} userId - current user id
     * @param {*} cardId - card id they want to delete
     */
    deleteCard(userId, cardId) { 
        appBackend.dbDelete("users." + userId + ".cards." + cardId);
    }

    /** 
     * 
     *
     */ 
    saveCardToUser(userId, cardId, transactions, diff) { 
        appBackend.dbAdd("users." + userId + ".cards", {
            cardId: cardId, 
            transactions: transactions,
            diff: diff
        }, (id) => { 
            console.log("successfully saved card to user");
        })
    }

    updateUserCard(cardId, amountSpent, diff) { 
        // TODO
    }

    /**
     * Add a transaction to user's transaction collection
     * @param {*} userId - current user id
     * @param {*} cardId - card id they want to delete
     * @param {*} storeInfo - store information (store name, address, category)
     * @param {*} amountSpent - amount spent at the store
     */
    saveTransactionToUser(userId, cardId, storeInfo, amountSpent) {
        timestamp = appBackend.getTimestamp();
        console.log("saving transactions");
        console.log("user id " + userId + "\n card id " + cardId + "\n store info " + storeInfo + "\n amountSpent " + amountSpent);
        appBackend.dbAdd("users." + userId + ".transactions", {
            cardId: cardId,
            storeInfo: {
                storeName: storeInfo["storeName"],
                address: storeInfo["address"],
                storeType: storeInfo["storeType"]
            },
            amountSpent: amountSpent,
            dateAdded: timestamp
        }, (id) => { 
            console.log("successfully saved transaction to user");
        })
    }

    /**
     * Gets all of a user's transactions
     * @param {string} userId - the user whose transactions to grab
     * 
     * @example
     *  user.getTransactions(userId, (data) => { 
     *      console.log(data);
     *      setTransactions(data);
     *      setDisplayTransactions(true);
     *  })
     */
    getAllTransactions(userId, callback) { 
        appBackend.dbGetSubCollections("users." + userId + ".transactions", (data) => { 
            callback(data);
        })
    }

    /**
     * Gets transactions for a user's card
     * @param {string} userId - user id of transactions to get
     * @param {string} cardId  - card id of card to get
     * @param {string} callback  - callback function to apply to each transaction object
     * 
     * @example
     *  user.getTransactionsForCard(userId, cardId, (data) => {
     *      setTransactions((transactions) => { 
     *      const newTransactions = [...transactions, data];
     *      return newTransactions;
     *  })
     */
    getTransactionsForCard(userId, cardId, callback) { 
        appBackend.dbGet("users." + userId + ".transactions", ["cardId", "==", cardId], (data) => { 
            callback(data);
        })
    }

    getRewards(userId, cardId, callback) {
        console.log("getting a user's rewards");
        // TODO get rewards for a card
        // TODO apply diff
    }
}

export var user = new userClass();