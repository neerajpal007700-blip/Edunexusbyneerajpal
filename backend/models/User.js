const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true,select:false},role:{type:String,enum:['student','admin'],default:'student'},classLevel:{type:String,default:'10'},avatar:String,progress:{type:Number,default:0}},{timestamps:true});
module.exports=mongoose.model('User',schema);
