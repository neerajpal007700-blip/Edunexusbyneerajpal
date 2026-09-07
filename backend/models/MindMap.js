const mongoose=require('mongoose'); const schema=new mongoose.Schema({
  displayOrder: { type: Number, default: 0 },title:{type:String,required:true},description:String,classLevel:String,subject:String,chapter:String,imageUrl:String,published:{type:Boolean,default:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true}); module.exports=mongoose.model('MindMap',schema);
