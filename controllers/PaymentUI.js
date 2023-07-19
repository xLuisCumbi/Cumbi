

const { signToken } = require('../utils');
const depositController = require('./Deposit');

module.exports = async (req, res)=> {

    const deposit_id = req.params.depositID;
    const resp = await depositController.status({deposit_id});
    if(resp.status != 'success'){ 

        res.status(404).json({message: "PAYMENT NOT FOUND"});
        return;

    }

    const sessionToken = signToken({deposit_id}, process.env.SESSION_SECRET, '7h');
    req.session.token = sessionToken;
    req.session.deposit_id = deposit_id;
    const depositObj = resp.depositObj;
    
    if(depositObj.address == null || depositObj.address == ""){

        res.render('select-network', depositObj);
        
    }else{

        depositObj.icon = depositObj.coin === 'USDT' ? '/images/usdt.png' : '/images/usdc.png';
        depositObj.network_short = depositObj.network === 'TRON' ? 'TRC20' : 'ERC20';
        depositObj.is_invoice = depositObj.type === 'invoice' ? true : false;
        res.render('pay', depositObj);

    }

}