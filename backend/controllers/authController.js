import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';




//SIGNUP
export const signup= async(req,res)=>{
    try{
        const{username,password,email}=req.body;

        //validate input
        if(!username||!password||!email){
            return res.status(400).json({message:"All fields are required"});
        }
        //check if user already exists
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        //hash password
        const salt=bcrypt.genSaltSync(10);
        const hashedPassword=bcrypt.hashSync(password,salt);

        //create new user
        const user= await User.create(
            {
                username,
                password:hashedPassword,
                email,
            }
        );

        //Generate JWT token
        const token=jwt.sign(
            {
                id:user._id,
            },
            process.env.JWT_SECRET,
            {expiresIn:"1h"}

        );
        res.status(201).json({
            message:"User created successfully",   
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
            }
        });


    }catch(error){
        console.log(error);
    }

}

//LOGIN

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};