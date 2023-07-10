
const DepositModel = require("../models/Deposit");
const AdminModel = require("../models/Admin");
const jwt = require("jsonwebtoken");
const { signToken } = require("../utils");

// AdminModel.sync({ alter: true});

const validateToken = (token)=>{
    return new Promise(resolve => {
        try{
            jwt.verify(token, process.env.JWT_SECRET, async function(err, adminObj){
                if(err) {
                    resolve({"status": "auth_failed", "message":"session expired kinldy login again 1"})
                }else{
                    if(adminObj.admin_id) {
                        const admin_id = adminObj.admin_id
                        const query = await AdminModel.findOne({ where: { admin_id: admin_id} }).catch()
                        if(query){
                            (query.admin_id == admin_id) 
                            ? resolve({ "status": "success", admin_id})
                            : resolve({ "status": "auth_failed", "message": "session expired kinldy login again"});
                        }else resolve({ "status": "auth_failed", "message": "session expired kinldy login again"});
                    }  
                }
            })      
        }catch(e){
            resolve({"status": "auth_failed", "message":"server error"})
        }
    })
}

const login = ({email,  password})=>{
    return new Promise(async resolve => {
        try{
            let passw = md5(process.env.LOGIN_SECRET + password);
            const query = await AdminModel.findOne({ where: { email, password: passw} }).catch()
            if(query){
                const admin_id = query.admin_id;
                const token = signToken({ admin_id }, process.env.JWT_SECRET, 5 * 60 * 60);
                resolve({ "status": "success", "token": token, email}); 
            }else resolve({ "status": "auth_failed", "message": "Incorrect username or password"}); 
        }catch(e){
            console.log(e);
            resolve({"status": "auth_failed", "message":"server error"})
        }
    })
}


const fetchDeposits = ({fetchMode, token})=>{
    return new Promise(async (resolve) => {
        try {
            const verify = await validateToken(token);
            if(verify.status == 'success'){
                const deposits = await DepositModel.findAll({raw: true, limit: 200});
                resolve({status: "success", deposits});
            }else resolve(verify);
        } catch (error) {
            resolve({status: "failed" , message:"server error: kindly try again"});
        }
    });
}

const update = ({ passphrase, email, password , token}) => {
    return new Promise(async (resolve) => {
        // try {
        //     const verify = await validateToken(token);
        //     if(verify.status == 'success'){
        //         adminObj = {};
        //         if(passphrase) adminObj.passphrase = passphrase;
        //         if(password) adminObj.password = md5(process.env.LOGIN_SECRET + password);
        //         if(email) adminObj.email = email;
        //         console.log(adminObj);
        //         await AdminModel.update(adminObj, {where: { admin_id : verify.admin_id } } );
        //         resolve({status: "success"});

        //     }else resolve(verify);
        // } catch (error) {
        //     console.log(error);
        //     resolve({status: "failed" , message:"server error: kindly try again"});
        // }
    });
}


const adminStats = (token) => {
    return new Promise(async (resolve) => {
        try {
            const verify = await validateToken(token);
            if(verify.status == 'success'){
                const num_deposit = await DepositModel.count();
                const num_successful_deposit = await DepositModel.count({where :{status: 'success'}});
                const stats = {

                    num_deposit,
                    num_successful_deposit,
                    num_pending_deposit: num_deposit - num_successful_deposit,
                    total_paid: Number(await DepositModel.sum('amount', { where: {status: 'success' }, raw: true }) ?? 0).toFixed(6)
                }
                resolve({status: "success", stats});
            }else resolve(verify)
        } catch (error) {
            resolve({status: "failed" , message:"server error: kindly try again"});
        }
    });
}



module.exports = {

    fetchDeposits,
    login,
    validateToken,
    update,
    adminStats
}
