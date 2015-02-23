# murder mystery
This is a single-page web-app game inspired by the classic board game "Clue" (Or "Cluedo" if you're outside the US).

There are a number of suspects - as of the time of writing these are a random bunch of famous people - and when the game is started one is murdered, and one is the murderer.

The suspects have various relationships - they can be married, having an illicit affair, blackmailing another suspect (over an affair) or leaving an inheritance to another suspect.

Each of these relationships gives the suspect a possible motivation to commit murder:
 - a suspect may kill someone for an inheritance
 - a suspect who is having an affair may be killed by the spouse of the person they are having the affair with
 - a suspect who is blackmailing someone may be killed by the blackmailee
 
 You "question" suspects by click on their names in the top row. When questioned the suspect may either
  - reveal a relationship they are involved in
  - tell you they have no more relationships to reveal
  - avoid revealing a relationship
  
  The relationships are displayed, at the time of writing, in several ways:
   - in a pop-up dialog box (a lightbox)
   - in an animated node graph (by vis)
   - in a grid
  ....I have not yet decided what the best way to display the information as it is revealed, so all the above are experiments and look a little messy currently
  
  There's also the beginnings of the ability to add player/suspect names at the top of the page. These don't do anything currently, however
  
  - Simon Amarasingham, as of 2/23/15
  
 
 
