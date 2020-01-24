import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TextInput, 
  Image, 
  Modal,
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ScrollView,
  Dimensions, 
} from 'react-native'
import firebase from 'react-native-firebase'
import Prompt from 'react-native-prompt';
import { GoogleSignin } from 'react-native-google-signin';

import normalize from '../../helpers/sizeHelper'
import Loading from '../loading'

import Footer from '../footer'
import Header from '../header'

import * as usersActions from '../../actions/user';

const { height, width } = Dimensions.get('window')


const mapDispatchToProps = (dispatch) => {
  return ({
    // usersActions: bindActionCreators({...usersActions}, dispatch),
  })
}

const mapStateToProps = (state) => {
  return ({
  })
}


class Account extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userInfo: {},
      editUser: {
        name: '',
        email: ''
      },
      editBillingInfo: {},

      cloudStorageInfo: {},

      loading: false,

      promptVisible: false,
      profileModalVisible: false,
      billingModalVisible: false
    }
  }

  toggleProfileModal(visible) {
    this.setState({ profileModalVisible: visible, editUser: this.state.userInfo });
  }

  toggleBillingModal(visible) {
    this.setState({ billingModalVisible: visible, editUser: this.state.userInfo });
  }

  validate = async() => {
    let valid = true;

    const { email, password, repeatPassword } = this.state
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if(email === ''){
      this.setState({errorMessage: 'Email is required!'})
      return false 
    }

    if(!regex.test(email)) {
      this.setState({errorMessage: 'Email is not correct format!'})
      return false 
    }

    if (password === '') {
      this.setState({errorMessage: 'Password is required!'})
      return false 
    }

    if (repeatPassword === '') {
      this.setState({errorMessage: 'Confirm password is required!'})
      return false 
    }

    if (password !== repeatPassword) {
      this.setState({errorMessage: 'Password is not matched!'})
      return false 
    }

    return true
  }

  async componentDidMount(){
    this.setState({loading: true})

    const user = await usersActions.getUserInfo()

    const isSignedIn = await GoogleSignin.isSignedIn()
    let storage = {}
    if(isSignedIn) {
      storage = await GoogleSignin.getCurrentUser();
    }


    await this.setState({
      userInfo: user || {},
      editUser: user || {},
      cloudStorageInfo: storage,
      editBillingInfo: user.billing_info || {}
    })

    this.setState({loading: false})
  }

  async updateProfile(password) {
    if(password == ''){
      alert('Please type password')
      return
    }

    this.setState({
      promptVisible: false,
      loading: true
    })

    const {editUser} = this.state
    const self = this

    await firebase.auth()
    .signInWithEmailAndPassword(this.state.userInfo.email, password)
      .then(async (userCredential) =>  {
          userCredential.user.updateEmail(editUser.email)

          await usersActions.updateUserProfile(editUser).then(() => {
            self.setState({
              loading: false,
              userInfo: {...self.state.userInfo, email:editUser.email, name: editUser.name }
            })

            Alert.alert(
              'Success',
              'Successfully Updated!',
              [
                {text: 'OK'},
              ],
              {cancelable: false},
            )
          })
          
      }).catch(error => {
        self.setState({loading: false})
        Alert.alert(
          'Error',
          error.message,
          [
            {text: 'OK'},
          ],
          {cancelable: false},
        )
      })

    this.setState({profileModalVisible: false})
  }

  async updateBillingInfo() {
    this.setState({
      loading: true
    })

    await usersActions.updateBillingInfo(this.state.editBillingInfo).then(() => {
      this.setState({
        userInfo: {...userInfo, billing_info: this.state.editBillingInfo},
        loading: false
      })

      Alert.alert(
        'Success',
        'Successfully Updated!',
        [
          {text: 'OK'},
        ],
        {cancelable: false},
      )
    }).catch(error => {
      this.setState({
        loading: false
      })

      Alert.alert(
        'Error',
        error.message,
        [
          {text: 'OK'},
        ],
        {cancelable: false},
      )
    })
  }

  gotoLogin = () => {
    this.props.navigation.navigate('Login')
  }

  render() {
    const {loading, userInfo, editUser, editBillingInfo, cloudStorageInfo} = this.state
    const billingInfo = userInfo.billing_info || {}

    return(
        <View style={styles.screen}>
          <View style={{flex: 1}}>
            <Header header={ 'My Account' } back={'Dashboard'} {...this.props}/>
          </View>

          <SafeAreaView style={styles.content}>
            <ScrollView>
              <View style={{paddingLeft: 15, paddingRight: 15, marginTop: 10, marginBottom: 10,}}>
                <View style={{display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                  <Image style={styles.iconImage} source={require('../../../assets/icons/profile1.png')}></Image>
                </View>

                <View style={styles.titleRow}>
                  <Text style={styles.groupTitle}>PROFILE</Text>
                  <TouchableOpacity onPress={ () => {this.toggleProfileModal(true)} }>
                    <View>
                      <Image style={{width: 30, height:30}} source={require('../../../assets/icons/pencil1.jpg')}></Image>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Name:
                  </Text>
                  <Text style={styles.itemContent}>
                    {userInfo.name}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Email:
                  </Text>
                  <Text style={styles.itemContent}>
                    {userInfo.email}
                  </Text>
                </View>

                <View style={styles.titleRow}>
                  <Text style={styles.groupTitle}>BILLING INFORMATION</Text>
                  <TouchableOpacity onPress={ () => {this.toggleBillingModal(true)} }>
                    <View>
                      <Image style={{width: 30, height:30}} source={require('../../../assets/icons/pencil1.jpg')}></Image>
                    </View>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Address:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.address}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    City:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.city}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    State:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.state}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Zip code:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.zip_code}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Card number:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.card_num}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Expiration:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.expiration}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    CVV:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.cvv}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Pay with Paypal:
                  </Text>
                  <Text style={styles.itemContent}>
                    {billingInfo.paypal}
                  </Text>
                </View>


                <View style={styles.titleRow}>
                  <Text style={styles.groupTitle}>CLOUD STORAGE</Text>
                  <TouchableOpacity onPress={ () => {this.toggleProfileModal(true)} }>
                    <View>
                      <Image style={{width: 30, height:30}} source={require('../../../assets/icons/pencil1.jpg')}></Image>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>
                    Google Driver:
                  </Text>
                  <Text style={styles.itemContent}>
                    {(cloudStorageInfo.user || {}).email}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>

          <View style={{flex: 1}}>
            <Footer
              onPressHome={ () => this.props.navigation.navigate('Dashboard') }
              onPressAccount={ () => this.props.navigation.navigate('Account') }
            />
          </View>
          <Loading show={loading} label="subscribing" closeLoading={() => {this.setState({loading: false})}}></Loading>
        
          <Modal animationType={"slide"} 
              transparent = {true}
              visible = {this.state.profileModalVisible}>

             <View style={styles.modalContainer}>
                <View style={{position: 'absolute', right: 20, top: 10}}>
                  <TouchableOpacity onPress = {() => {
                      this.toggleProfileModal(!this.state.profileModalVisible)}}>
                    <View>
                      <Text style={{fontSize: 50, color: 'white'}}>×</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                
                <View >
                  <Text style={{color: 'white', fontSize: 25, textAlign:'center'}}>Edit Profile</Text>

                  <TextInput 
                    onChangeText={(name) => this.setState({editUser: {...editUser, name: name}})}
                    style={styles.inputField}
                    value={editUser.name}
                    placeholder={"Name"}/>

                  <TextInput 
                    onChangeText={(email) => this.setState({editUser: {...editUser, email: email}})}
                    style={styles.inputField}
                    value={editUser.email}
                    placeholder={"Email"}/>

                </View>

                <TouchableOpacity onPress = {() => this.setState({promptVisible: true})}>
                  <View style={[styles.buttonContainer]}>
                    <Text style={styles.buttonTitle}>Update</Text>
                  </View>
                </TouchableOpacity>
             </View>
          </Modal>

          <Prompt
            title="Please type your password"
            placeholder="password"
            defaultValue=""
            visible={ this.state.promptVisible }
            textInputProps ={{secureTextEntry: true}}
            onCancel={ () => this.setState({
              promptVisible: false
            }) }
            onSubmit={(value) => this.updateProfile(value)}/>

          <Modal animationType={"slide"} 
              transparent = {true}
              visible = {this.state.billingModalVisible}>
               <View style={styles.modalContainer}>
                  <View style={{position: 'absolute', right: 20, top: 10}}>
                    <TouchableOpacity onPress = {() => {
                        this.toggleBillingModal(!this.state.billingModalVisible)}}>
                      <View>
                        <Text style={{fontSize: 50, color: 'white'}}>×</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  <View >
                    <Text style={{color: 'white', fontSize: 25, textAlign:'center'}}>Edit Billing Information</Text>

                    <TextInput 
                      onChangeText={(address) => this.setState({editBillingInfo: {...editBillingInfo, address: address}})}
                      style={styles.inputField}
                      value={editBillingInfo.address}
                      placeholder={"Address"}/>

                    <TextInput 
                      onChangeText={(city) => this.setState({editBillingInfo: {...editBillingInfo, city: city}})}
                      style={styles.inputField}
                      value={editBillingInfo.city}
                      placeholder={"City"}/>

                    

                    <View style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row'}}>

                      <TextInput 
                        onChangeText={(state) => this.setState({editBillingInfo: {...editBillingInfo, state: state}})}
                        style={styles.inputField2}
                        value={editBillingInfo.state}
                        placeholder={"State"}/>
                      <TextInput 
                        onChangeText={(zip_code) => this.setState({editBillingInfo: {...editBillingInfo, zip_code: zip_code}})}
                        style={styles.inputField2}
                        value={editBillingInfo.zip_code}
                        placeholder={"Zip Code"}/>

                    </View>
                    

                    <TextInput 
                      onChangeText={(card_num) => this.setState({editBillingInfo: {...editBillingInfo, card_num: card_num}})}
                      style={styles.inputField}
                      value={editBillingInfo.card_num}
                      placeholder={"Card Number"}/>


                    <View style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row'}}>
                      <TextInput 
                        onChangeText={(expiration) => this.setState({editBillingInfo: {...editBillingInfo, expiration: expiration}})}
                        style={styles.inputField2}
                        value={editBillingInfo.expiration}
                        placeholder={"Expiration"}/>
                      <TextInput 
                        onChangeText={(cvv) => this.setState({editBillingInfo: {...editBillingInfo, cvv: cvv}})}
                        style={styles.inputField2}
                        value={editBillingInfo.cvv}
                        placeholder={"CVV"}/>
                    </View>

                    <TextInput 
                      onChangeText={(paypal) => this.setState({editBillingInfo: {...editBillingInfo, paypal: paypal}})}
                      style={styles.inputField}
                      value={editBillingInfo.paypal}
                      placeholder={"Pay with Paypal"}/>

                  </View>

                  <TouchableOpacity onPress = {this.updateBillingInfo.bind(this)}>
                    <View style={[styles.buttonContainer]}>
                      <Text style={styles.buttonTitle}>Update</Text>
                    </View>
                  </TouchableOpacity>
               </View>
          </Modal>
        </View>
    )

  }

}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: rgb(87, 95, 172, 0.9)
  },
  homeImage: {
    width: '100%',
    height: '100%',
  },
  iconImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 20
  },
  title:{
    color: 'white',
    fontSize: 25,
    marginBottom: 20
  },
  itemTitle: {
    fontSize: 15,
    color: '#52565A'
  },
  itemContent: {
    fontSize: 15,
    color: '#52565A'
  },
  groupTitle: {
    color: 'darkgrey',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10
  },
  headerImage: {
    width: normalize(200),
    height: normalize(60),
    margin: 15
  },
  content: {
    justifyContent: 'center',
    flex: 10
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingTop: 15,
    paddingBottom: 15
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 10
  },
  inputField: {
    fontSize: 17,
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: width - 60,
    height: 50,
    paddingLeft: 20,
    paddingRight: 20
  },

  inputField2: {
    fontSize: 17,
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: (width-60)/2 - 10,
    height: 50,
    paddingLeft: 20,
    paddingRight: 20
  },
  messageText: {
    color: '#d00',
    textAlign: 'center',
    fontSize: normalize(16),
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30,
  },
  signinText: {
    fontSize: normalize(16),
    color: 'white',
    textAlign: 'center',
  },
  signUpImage: {
    width: normalize(16),
    height: normalize(16)
  },
  buttonContainer: {
    backgroundColor: 'rgba(195,195,195,0.60)',
    borderRadius: 20,
    height: 44,
    minWidth: 120,
    display: 'flex',
    justifyContent: 'center',
    width: width - 60,
    marginTop: 20
  },
  buttonTitle: {
    fontSize: normalize(16), 
    color: '#ffffff',
    fontWeight: 'normal',
    textAlign: 'center'
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(Account)