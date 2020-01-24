import { AsyncStorage } from 'react-native'
import { USER, COMMON } from '../../config/types'

import firebase from 'react-native-firebase'
import {DB} from '../../utils/constants';

const usersRef = firebase.firestore().collection(DB.USERS);


export function FBObj (snapshot) {
  if (snapshot.exists) {
    return snapshot.data();
  } else {
    return null;
  }
}

export const storeAsyncUserData = async (email, password) => {
  try {
    await AsyncStorage.setItem('is_authed', 'true')
    await AsyncStorage.setItem('email', email)
    await AsyncStorage.setItem('password', password)
    return true
  } catch (error) {
    return false
  }
}


export const getAsyncUserData = async () => {
  try {
    let is_authed = await AsyncStorage.getItem('is_authed')
    let email = await AsyncStorage.getItem('email')
    let password = await AsyncStorage.getItem('password')

    alert(email)
    return { is_authed, email, password }
  } catch (error) {
    return false
  }
}

export const removeAsyncUserData = async () => {
  try {
    await AsyncStorage.removeItem('is_authed')
    await AsyncStorage.removeItem('authedUser')
    await AsyncStorage.removeItem('password')
    return true
  } catch (error) {
    throw error
  }
}


export const signIn = (user) => {
  return (dispatch) => {
    
  }
}


export const signUp = (user) => {
  return async (dispatch) => {
    await usersRef.doc(user.id).set({
      ...user
    })
  }
}


export const getUserInfo = async () => {
  const current_user = firebase.auth().currentUser;
  const resp = await usersRef.doc(current_user.uid).get();
  
  return FBObj(resp)
}


export const updateUserProfile = async (editUser) => {
  const current_user = firebase.auth().currentUser;

  return await usersRef.doc(current_user.uid).update({
    email: editUser.email,
    name: editUser.name
  })
}


export const updateBillingInfo = async (billing_info) => {
  const current_user = firebase.auth().currentUser;

  return await usersRef.doc(current_user.uid).update({
    billing_info: billing_info
  })
}

export const checkAuthed = () => {
  return (dispatch) => {
    
  }
}

export const signOut = () => {
  return (dispatch) => {
    
  }
}