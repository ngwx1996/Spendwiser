import { app } from 'firebase';
import { appBackend } from './backend';

let mainNeedsUpdate = false;

/**
 * A user class that peforms user database options
 */
class userClass { 

    currentStore = null;
    newTransactions = [];
    editedTransactions = [];
    newOrDeletedCards = false;

    /**
     * Checks if the user is currently in the "users" database. If not  
     * in the database, registers the user. Returns the user id
     */
    async getUserId() { 
        return new Promise((resolve, reject) => {
            appBackend.getUserID((userId) => {
                if (userId == null) { 
                    // user is not using a login, store all data locally?
                    resolve("test");
                } else {
                    appBackend.dbDoesDocExist("users." + userId, (docExists) => {
                        if (!docExists) {
                            this.addUser(userId);
                        }
                    });
                    resolve(userId);
                }
            });
        })
    }

    /**
     * Adds a user to the card database with inital date added
     * 
     * @param {String} userId - the user's id after logged in 
     */
    async addUser(userId) { 
        userId = await userId;
        var date = new Date();

        appBackend.dbSet("users." + userId, { 
            dateCreated: date
            // TODO: maybe add name and email here?
        }, false, () => {
            // TODO: introduce callback?
        });
    }

    /**
     * Gets the cards associated with a user id
     * @param {string} userId - The User Id
     */
    async getCards(userId) { 
        userId = await userId;
        return new Promise((resolve, reject) => { 
            appBackend.dbGetSubCollections("users." + userId + ".cards", (data) => {
                resolve(data);
            })
        })
    }

    /**
     * Get the docId for the user's 'cards' collection for the given cardId
     * 
     * @param {*} cardId - The cardId from the global 'cards' collection
     */
    async getCardDocId(userId, cardId) {
        userId = await userId;
        return new Promise((resolve, reject) => {
            appBackend.dbGetSubCollections("users." + userId + ".cards", (data) => {
                data.forEach(element => {
                    if (element.cardId === cardId) resolve(element.docId);
                });
            })
        });
    }

    /**
     *  Deletes a card from the user's database, including transactions related to that card 
     * @param {string} userId - current user id
     * @param {string} cardId - card id to delete
     * @param {string} docId - document id of card to delete
     * 
     * @example
     * user.deleteCard(userId, cardId, docId);
     */
    async deleteCard(userId, cardId, docId) { 
        userId = await userId;
        appBackend.dbDelete("users." + userId + ".cards." + docId);

        appBackend.dbGetSubCollections("users." + userId + ".transactions", (transactions) => { 
            for (let i=0 ; i< transactions.length ; i++ ) { 
                if (transactions[i].cardId == cardId) { 
                    appBackend.dbDelete("users." + userId + ".transactions." + transactions[i].docId);
                }
            }
            mainNeedsUpdate = true;
            this.newOrDeletedCards = true;
        })
    }

    // TODO - needs date added?
    /**
     * Saves a card to a user
     * @param {string} userId - user id to save card to
     * @param {*} cardId - card id to save reference to
     * @param {*} transactions - should be null when saving initial card to user
     * @param {*} diff  - should be null when saving initial card to user
     */
    async saveCardToUser(userId, cardId, transactions, diff) { 
        userId = await userId;
        return new Promise((resolve, reject) => {
            appBackend.dbAdd("users." + userId + ".cards", {
                cardId: cardId, 
                transactions: transactions,
                diff: diff
            }, (id) => { 
                appBackend.dbSet("users." + userId + ".cards." + id, {'docId': id}, true, () => {
                    mainNeedsUpdate = true;
                    this.newOrDeletedCards = true;
                    resolve();
                });
            })
        })
    }

    /**
     * Add a transaction to user's transaction collection
     * @param {string} userId - current user id
     * @param {string} cardId - card id they want to delete
     * @param {object} storeInfo - store information (store name, address, category)
     * @param {number} amountSpent - amount spent at the store
     */
    async saveTransaction(userId, cardId, storeInfo, amountSpent, callback) {
        userId = await userId;
        timestamp = appBackend.getTimestamp();
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
            this.newTransactions.push({
                cardId: cardId,
                storeInfo: {
                    storeName: storeInfo["storeName"],
                    address: storeInfo["address"],
                    storeType: storeInfo["storeType"]
                },
                amountSpent: amountSpent,
                dateAdded: timestamp,
                docId: id
            });

            appBackend.dbSet("users." + userId + ".transactions." + id, {'docId': id}, true, () => {
                callback(id);
            })
        })
    }

   
    /**
     * Adds the document id of a transaction to it's document
     * @param {string} userId - current user id
     * @param {string} docId  - document id of transaction
     */
    async addTransactionId(userId, docId) { 
        userId = await userId;
        appBackend.dbSet("users." + userId + ".transactions." + docId, {
            docId: docId
        }, 
        true, () => {
            // TODO: introduce callback?
        });
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
    async getAllTransactions(userId, callback) { 
        userId = await userId;
        appBackend.dbGetSubCollections("users." + userId + ".transactions", (data) => { 
            callback(data);
        })
    }

    /**
     * Gets all of a user's transactions within a selected timeframe
     * @param {string} userId - the user whose transactions to grab
     * @param {Date} startTimeframe - the chosen start of timeframe
     * @param {Date} endTimeframe - the chosen end of timeframe
     * 
     * @example
     *  TODO - Nathan Ng
     */
    async getTimeFrameTransactions(userId, startTimeframe, endTimeframe, callback) {
        userId = await userId;
        // console.log(startTimeframe);
        // console.log(endTimeframe);
        appBackend.dbGet("users." + userId + ".transactions",
            ["dateAdded", ">", startTimeframe],
            ["dateAdded", "<", endTimeframe],
            (data) => { 
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
    async getTransactionsForCard(userId, cardId, callback) { 
        userId = await userId;
        appBackend.dbGet("users." + userId + ".transactions", ["cardId", "==", cardId], callback);
    }

    /**
     * Edits a user's transaction
     * @param {string} userId - current user id
     * @param {string} docId  - document id of transaction to alter
     * @param {object} data - data to set transaction information to
     */
    async editTransaction(userId, docId, data) { 
        userId = await userId;
        appBackend.dbSet("users." + userId + ".transactions." + docId, data, true, () => {
            // Update editedTransactions array to sync spendingsummary if exist in navigation stack
            this.editedTransactions.push({
                docId: docId,
                amountSpent: data.amountSpent,
            });
        });
    }

    /**
     * Deletes a transaction from a user
     * @param {string} userId - current user id
     * @param {string} docId - id of transaction to delete
     */
    async deleteTransaction(userId, docId) {
        userId = await userId;
        appBackend.dbDelete("users." + userId + ".transactions." + docId);
        // Update editedTransactions array to sync spendingsummary if exist in navigation stack
        this.editedTransactions.push({
            docId: docId,
            amountSpent: null,
        });
    }

    /**
     * Gets a user's rewards. In user backend because user diff is need to apply 
     * to card rewards
     * @param {*} userId - user id of diff to get
     * @param {*} cardId - card id of card rewards to get
     * @param {*} callback - callback function to apply to resultant data
     * 
     * @example
     * TODO
     */
    async getRewards(userId, cardId, callback) {
        userId = await userId;
        appBackend.dbGet("cards." + cardId, (data)=> { 
            // TODO apply diff
            if (typeof data != 'undefined' && 'rewards' in data && 'conversion' in data) {
                let rewardsMap = data.rewards;
                for (var key in rewardsMap) {
                    rewardsMap[key] *= data.conversion;
                }
                callback(rewardsMap);
            } else {
                callback(null);
            }
        })
    }

    /**
     * Get whether the main page needs to update
     */
    getMainNeedsUpdate() {
        return mainNeedsUpdate;
    }

    /**
     * Set whether the main page needs to update
     * 
     * @param {boolean} flag - new boolean for flag
     */
    setMainNeedsUpdate(flag) {
        mainNeedsUpdate = flag;
    }
}

export var user = new userClass();