import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';


function EditTransactionModal({transaction, modalVisible, setModalVisible, transactions, setTransactions}) {
    const deviceHeight =
        Platform.OS === 'ios'
        ? Dimensions.get('window').height
        : Dimensions.get('screen').height;
    const [transactionInput, setTransactionInput] = useState("");
    const [displayErrorText, setDisplayErrorText] = React.useState(false);
    const userId = user.getUserId();
    // handle no currently selected document
    var docId;
    if (transaction) { 
        docId = transaction.docId;
    }

    // TODO: this should also probably account for whitespace, etc.
    const isInputValid = (input) => { 
        if (isNaN(parseFloat(input))) { 
            return false;
        }
        return !isNaN(input); 
    }

    const editTransaction = () => {
        const inputIsValid = isInputValid(transactionInput);
        if (inputIsValid) {
            user.editTransaction(
                userId,
                docId,
                {
                    amountSpent: transactionInput
                }
            )
            setModalVisible(false);
            let newTransactions = [...transactions];
            newTransactions[newTransactions.length - 1 - transaction.key].amountSpent = transactionInput;
            setTransactions(newTransactions);
        } else {
            setDisplayErrorText(true);

            setTimeout(function () {
                setDisplayErrorText(false);
            }, 2000)
        }
    }
    return (
        <Modal
            backdropOpacity={0.3}
            isVisible={modalVisible}
            statusBarTranslucent={true}
            deviceHeight={deviceHeight}
            style={{
                margin: 0,
                marginHorizontal: 0,
                justifyContent: 'center',
            }}
            onBackdropPress={()=> {setModalVisible(false)}}
            avoidKeyboard={true}
        >
            { transaction !== null &&
            <View style={modalStyles.modalCenteredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons
                                name="close-circle-outline"
                                color="black"
                                size={26}
                            ></Ionicons>
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyles.modalBody}>
                        <Text style={{fontWeight: 'bold', fontSize: 16}}>{transaction.storeInfo.storeName}</Text>
                        <Text>{transaction.dateAdded.toString().substring(0,24)}</Text>
                        <Text>${transaction.amountSpent + "\n"}</Text>
                        <Text>Amount wrong? Input a new amount</Text>
                        {
                            displayErrorText &&
                            <Text style={modalStyles.errorText}>Please input a valid number</Text>
                        }
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={modalStyles.manualTextInput}
                                onChangeText={(text) => setTransactionInput(text)}
                                value={transactionInput}
                                placeholder={"amount in dollars"}
                                keyboardType={"numeric"}
                            />
                            <TouchableOpacity onPress={() => { editTransaction(transactionInput), setTransactionInput("") }}>
                                <Ionicons
                                    name="checkmark-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            }
        </Modal>
    )
}

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        margin: 22,
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalHeader: { 
        margin: 8
    },
    modalBody: { 
        alignItems: 'center',
        marginTop: -16
    },
    manualTextInput: {
        height: 40,
        borderWidth: 1,
        marginRight: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '80%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center'
    }
});

export { EditTransactionModal };