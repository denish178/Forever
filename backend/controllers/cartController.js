import userModel from "../models/userModel.js"
import { sendError, sendSuccess } from "../utils/apiResponse.js";


// add products to user cart
const addToCart = async (req,res) => {
    try {
        
        const { userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        return sendSuccess(res, { message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        return sendError(res, error.message, 500)
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        return sendSuccess(res, { message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        return sendError(res, error.message, 500)
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        return sendSuccess(res, { cartData })

    } catch (error) {
        console.log(error)
        return sendError(res, error.message, 500)
    }

}

export { addToCart, updateCart, getUserCart }
