const mongoose=require('mongoose'); const schema=new mongoose.Schema({
  displayOrder: { type: Number, default: 0 },title:{type:String,required:true},description:String,youtubeId:String,url:String,thumbnailUrl:String,classLevel:String,subject:String,published:{type:Boolean,default:true},publishedAt:Date},{timestamps:true}); module.exports=mongoose.model('Video',schema);
