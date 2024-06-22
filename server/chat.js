const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
var fetchuser = require('./middleware/fetchuser');
const Note =require('./models/Chat');

//get all notes
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try{
        const notes = await Note.find({user:req.user.id});
        res.json(notes)
    }catch(error){
        console.log(error.message);
        res.status(500).send("internal server error occurred");
    }
    
})
//add a new note
router.post('/addnote',fetchuser,[
    body('title','enter valid title').isLength({min:3}),
    body('description','description must be atleast 5 characters').isLength({min:5}),
],async (req,res)=>{
    try{

    const {title,description,tag}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()});
    }
    const note = new Note({
       title,description,tag,user:req.user.id
    })
    const savedNote = await note.save()
    res.json(savedNote)
    } catch(error){
        console.log(error.message);
        res.status(500).send("internal server error occurred");
    }
})
//update note
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
     const {title,description,tag}=req.body;
     try{
     //create new note object
     const newNote = {};
     if(title){newNote.title= title};
     if(description){newNote.description=description};
     if(tag){newNote.tag=tag};
     //find note to be updated and update
     let note =await Note.findById(req.params.id);
     if(!note){return res.status(404).send("not found")}
     if(note.user.toString()!==req.user.id){
        return res.sendStatus(401).send("not allowed");}
    note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note}); 
    }catch(error){
        console.log(error.message);
        res.status(500).send("internal server error occurred");
    }
})

//delete 
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
   try{
    //find note to be deleted
    let note =await Note.findById(req.params.id);
    if(!note){return res.status(404).send("not found")}
    //allow deletion only if user owns this note
    if(note.user.toString()!==req.user.id){
       return res.sendStatus(401).send("not allowed");}
   note = await Note.findByIdAndDelete(req.params.id)
   res.json("success in deletion");
   }catch(error){
    console.log(error.message);
    res.status(500).send("internal server error occurred");
   }
})
module.exports = router