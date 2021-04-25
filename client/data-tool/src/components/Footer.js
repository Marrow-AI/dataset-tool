import React from 'react';
import { NavLink } from 'react-router-dom';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

const Footer = () => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="footerCointainer">
        <div className="mainFooter">
          <div className="footerDiv">
            <div>
              <button className='btn footer' onClick={handleClickOpen}>About </button>
            </div>
            <div >
              <div className='logosdiv'>
                <a href='https://atlasv.io/' target="_blank"><img className='logos' src="/static/atlasV.png" alt='' /></a>
                <a href='https://www.nfb.ca/interactive/marrow' target="_blank"><img className='logos' src="/static/NFB.png" alt='' /></a>
                <a href='https://ars.electronica.art/news/de/' target="_blank"><img className='logos' src="/static/Ars-Electronica.png" alt='' /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
     
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"About Dataset Tool"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The struggle in collecting and allocating data is a real struggle for the majority of people who are outside of those big companies.
            It has real implications for our lives.
            The dataset tool aims to explore alternative methods that can help us augment and allocate dataset for machine learning training.
            <br />
            <br />
            This tool was developed and designed for Ars Electronica Future Thinking School by
            <a className='link footer' href="https://avner.js.org/" alt="" target="_blank" rel="noopener noreferrer"> Avner Peled </a>
            and <a className='link footer' href="https://shirin.works/" alt="" target="_blank" rel="noopener noreferrer">shirin anlen</a>,
            and is part of the development of the
            <a className='link footer' href="https://shirin.works/Marrow-teach-me-how-to-see-you-mother-Machine-learning-immersive" alt="" target="_blank" rel="noopener noreferrer"> Marrow project</a>,
            with the support of the National Film Board of Canada.
            <br />
            <br />
            Read more about the motivation and code in this <a className='link footer' href="https://towardsdatascience.com/small-family-small-dataset-7f7db708f06d" alt="" target="_blank" rel="noopener noreferrer">
              Medium post</a>.

          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <button className='btn footer' onClick={handleClose}> close </button>
        </DialogActions>
      </Dialog>
     
    </>
  );
};

export default Footer;