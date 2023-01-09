const { connection } = require('mongoose')
const UserColl = connection.collection('user')

exports.SignIn = async (UserFilter) => {
    UserColl.insertOne(UserFilter)
}

exports.CheckUser = async (UserName,Location) => {
    const userdata = await UserColl.findOne({name : UserName, location : Location})
    return userdata
}

exports.UpdateUser = async (UserName,User_Total_data,Location) => {
    UserColl.updateOne({name : UserName, location : Location}, {$set : {total_data : User_Total_data}})
}

exports.Userdata = async (Username, Location) => {
    const userdata = UserColl.findOne({name : Username, location : Location})
    return userdata
} 