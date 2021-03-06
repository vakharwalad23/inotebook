import React from 'react';
import {useNavigate} from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import AddNote from './AddNote';
import noteContext from '../context/notes/noteContext';
import Noteitem from './Noteitem';

const Notes = (props) => {
  const context = useContext(noteContext);
  let navigate = useNavigate();
  const { notes, getNotes, editNote} = context;
  const [query , setQuery] = useState('');
  useEffect(() => {
    if(localStorage.getItem('token')){
      getNotes();
    }
    else{
      props.showAlert("Please login first","warning");
      navigate('/login');
    }
    // eslint-disable-next-line
  }, []);
  const ref = useRef(null);
  const refClose = useRef(null);
  const [note, setNote] = useState({id:"", etitle: "", edescription: "", etag: ""});
  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({id: currentNote._id, etitle: currentNote.title , edescription: currentNote.description, etag: currentNote.tag});
  }
  const handleClick = (e)=>{
    console.log("Updating", note);
    editNote(note.id, note.etitle, note.edescription, note.etag);
    refClose.current.click();
    props.showAlert("Updated Successfully", "success");
  }
  const onChange = (e)=> {
    setNote({...note, [e.target.name]: e.target.value})
  }
  return (
    <>
      <AddNote mode={props.mode} showAlert={props.showAlert}/>
      <button style={{display:"none"}} ref={ref} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Launch demo modal
      </button>
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className={`modal-content`} style={{backgroundColor:props.mode==='light'?'white':'#25292e'}}>
            <div className="modal-header">
              <h5 className="modal-title" style={{color:props.mode==='light'?'black':'#DDDDDD'}} id="exampleModalLabel">Edit Note</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div>
                <div className="container my-3">
                  <h2 style={{color:props.mode==='light'?'black':'#DDDDDD'}}>Enter Details To be Updated</h2>
                  <form className='my-2'>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label" style={{color:props.mode==='light'?'black':'#DDDDDD'}}>Title</label>
                      <input autoComplete="off" type="text" className={`form-control bg-${props.mode==='light'?'light':'dark'}`} style={{color:props.mode==='light'?'black':'#DDDDDD'}} id="etitle" name='etitle' aria-describedby="emailHelp" onChange={onChange} value={note.etitle ?? ""} minLength={5} required/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label" style={{color:props.mode==='light'?'black':'#DDDDDD'}}>Description</label>
                      <textarea rows="3" className={`form-control text2 bg-${props.mode==='light'?'light':'dark'}`} style={{color:props.mode==='light'?'black':'#DDDDDD' }} id="edescription" name='edescription' onChange={onChange} value={note.edescription ?? ""} minLength={5} required/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="tag" className="form-label" style={{color:props.mode==='light'?'black':'#DDDDDD'}}>Tag</label>
                      <input autoComplete="off" type="text" className={`form-control bg-${props.mode==='light'?'light':'dark'}`} style={{color:props.mode==='light'?'black':'#DDDDDD' }} id="etag" name='etag' onChange={onChange} value={note.etag ?? ""}/>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button onClick={handleClick} type="button" className={`btn btn-${props.mode==='light'?'primary':'secondary'}`}>Update Note</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row my-3">
        <h2 style={{color:props.mode==='light'?'black':'#DDDDDD'}}>Your Notes</h2>
        {notes.length !== 0 && <form className="d-flex" role="search">
        <input autoComplete="off" className={`form-control me-2 search bg-${props.mode==='light'?'light':'dark'}`} style={{color:props.mode==='light'?'black':'#DDDDDD' }} type="search" placeholder="Search" aria-label="Search" onChange={event => setQuery(event.target.value)}/>
      </form>}
        {notes.length === 0 && <div className='container mx-2'>No notes to display</div>}
        {notes
        .filter((value)=>{
          if(query === ''){
            return value;
          }
          else if(value.title.toLowerCase().includes(query.toLowerCase()) || value.description.toLowerCase().includes(query.toLowerCase()) || value.tag.toLowerCase().includes(query.toLowerCase())){
              return value;
              }
            })
        .sort((a, b) => a.date > b.date?-1:1)
        .map((note) => {
          return (<Noteitem mode={props.mode} key={note._id} updateNote={updateNote} note={note} showAlert={props.showAlert}/>)
          ;
        })}
      </div>
    </>
  )
}

export default Notes