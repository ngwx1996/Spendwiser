import React, { useState} from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

/**
 * Modal for main screen, which displays store list and provides functionality to manually input a store
 * @param {Object} obj - Object from Main Screen to be passed to Main Modals
 * @param {boolean} obj.modalVisible - State of whether modal should be visible
 * @param {function} obj.setModalVisible - Function to change state of modalVisible
 * @param {function} obj.reloadRecCard - Function from Main Screen to be invoked on store change
 * @param {function} obj.addManualInput - Function from Main Screen to be invoked when user adds new manual store
 * @param {array} obj.storeArr - Current list of stores
 * @param {string} obj.curStore - Current selected store
 * @param {Object} obj.userLocation - Object which contains user's current longitude and latitude
 * @module MainModals
 * @see MainScreen
 */
export function MainModals(
    {
        modalVisible,
        setModalVisible,
        reloadRecCard,
        addManualInput,
        storeArr,
        curStore,
        userLocation,
    }) {
    const deviceHeight =
        Platform.OS === 'ios'
        ? Dimensions.get('window').height
        : Dimensions.get('screen').height;
    const [manualInput, setManualInput] = useState({storeName: "", vicinity: "", storeType: ""});
    const [manualModal, setManualModal] = useState(false);
    const categories = [
        {
            label: 'Dining',
            value: 'Dining',
        },
        {
            label: 'Drugstore',
            value: 'Drugstore',
        },
        {
            label: 'Gas',
            value: 'Gas',
        },
        {
            label: 'Grocery',
            value: 'Grocery',
        },
        {
            label: 'Home Improvement',
            value: 'Home Improvement',
        },
        {
            label: 'Others',
            value: 'Others',
        },
        {
            label: 'Travel',
            value: 'Travel',
        },
    ];
    const placeholder = {
        label: "Category (Required)",
        value: "",
        color: '#9EA0A4',
      };
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
                onBackdropPress={()=> {setModalVisible(false); setManualModal(false)}}
                avoidKeyboard={true}
            >
                <View style={modalStyles.modalCenteredView}>
                    <View style={modalStyles.modalView}>

                        {/* Modal header */}
                        <View style={modalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => {setModalVisible(false); setManualModal(false)}}>
                                <Ionicons
                                    name="close-circle-outline"
                                    color="black"
                                    size={26}
                                ></Ionicons>
                            </TouchableOpacity>
                            {
                                !manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(true)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Don't see your store?</Text>
                                </TouchableOpacity>
                            }
                            {
                                manualModal &&
                                <TouchableOpacity onPress={() => setManualModal(false)}>
                                    <Text style={modalStyles.manualModalSwitchText}>Select from store list</Text>
                                </TouchableOpacity>
                            }
                        </View>

                        {/* Modal body */}
                        {/* Pick from store list */}
                        {
                            !manualModal &&
                            <ScrollView>
                                {
                                    storeArr.map((store, i) => { 
                                        var storeName = store.value;
                                        var storeIsSelected = (storeName == curStore);
                                        return (
                                            <TouchableOpacity 
                                                key={i}
                                                onPress={()=> {
                                                    if (!storeIsSelected) {
                                                        reloadRecCard(storeName, i, storeArr[i].storeType, storeArr[i].geometry);
                                                        setModalVisible(false);
                                                    }     
                                                }}
                                                style={i === 0 ? {borderTopWidth: 0.5, borderBottomWidth: 0.5} : {borderBottomWidth: 0.5}}
                                            >
                                                <Text style={storeIsSelected ? modalStyles.storeTextSelected : modalStyles.storeText}>
                                                        {storeName}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView>
                        }

                        {/* Manual store input */}
                        {
                            manualModal &&
                            <View>
                                <Text style={modalStyles.manualTitle}>Input the store near you</Text>
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, storeName: text };
                                        })
                                    }}
                                    value={manualInput.storeName}
                                    placeholder={"Store Name (Optional)"}
                                />
                                <TextInput
                                    style={modalStyles.manualTextInput}
                                    onChangeText={text => {
                                        setManualInput((prevState) => {
                                            return { ...prevState, vicinity: text };
                                        })
                                    }}
                                    value={manualInput.vicinity}
                                    placeholder={"Address (Optional)"}
                                />
                                <View style={modalStyles.picker}>
                                    <RNPickerSelect
                                        placeholder={placeholder}
                                        items={categories}
                                        onValueChange={value => {
                                            setManualInput((prevState) => {
                                                return { ...prevState, storeType: value };
                                            });
                                        }}
                                        style={{
                                        ...pickerSelectStyles,
                                        iconContainer: {
                                            top: 10,
                                            right: 12,
                                        },
                                        }}
                                        value={manualInput.storeType}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => {
                                        return <Ionicons name="md-arrow-down" size={24} color="gray" />;
                                        }}
                                    />
                                </View>
                                {
                                    (manualInput.storeType.length != 0) &&
                                    <Button
                                        onPress={() => {
                                            setModalVisible(!modalVisible);
                                            setManualModal(false);
                                            if (manualInput.storeType.length != 0) {
                                                let storeArrLen = (storeArr.length).toString();
                                                let manualInputObj = {
                                                    label: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                    value: manualInput.storeName.length === 0 ? "Manual Input " + storeArrLen : manualInput.storeName,
                                                    vicinity: manualInput.vicinity.length === 0 ? "N/A" : manualInput.vicinity,
                                                    storeType: manualInput.storeType,
                                                    geometry: [userLocation.latitude, userLocation.longitude],
                                                    placeId: "",
                                                    key: Object.keys(storeArr).length,
                                                }
                                                addManualInput(manualInputObj);
                                            }
                                            setManualInput({storeName: "", vicinity: "", storeType: ""});
                                        }}
                                        title="Set"
                                        style={{ margin: 10 }}
                                    ></Button>
                                }
                                {
                                    (manualInput.storeType.length == 0) &&
                                    <Text style={modalStyles.setButtonNotAllowed}>Set</Text>
                                }
                            </View>
                        }
                    </View>
                </View>
            </Modal>
    );
}

const modalStyles = StyleSheet.create({
    modalCenteredView: {
        justifyContent: 'center',
        alignItems: 'stretch',
        marginHorizontal: 22,
        backgroundColor: 'rgba(128, 128, 128, 0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        maxHeight: Dimensions.get('window').height / 2
    },
    modalHeader: { 
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between', 
        margin: 8,
        alignItems: 'center'
    },
    manualTitle: { 
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 4
    },
    manualTextInput: {
        height: 40,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '90%',
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        padding: 10
    },
    picker: {
        height: 45,
        borderWidth: 1,
        margin: 15,
        marginTop: 7,
        marginBottom: 7,
        width: '90%',
        borderRadius: 5,
        borderColor: '#F0F0F0',
        backgroundColor: '#F0F0F0',
    },
    manualModalSwitchText: {
        color: 'dodgerblue'
    }, 
    storeText: { 
        padding: 10,
        paddingLeft: 15
    },
    storeTextSelected: { 
        padding: 10,
        paddingLeft: 15,
        backgroundColor: '#778899'
    },
    setButtonNotAllowed: { 
        color: 'gray',
        fontSize: 20,
        alignSelf: 'center',
        margin: 10
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: '#F0F0F0',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });