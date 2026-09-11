(function(){
  const app=document.querySelector('.app');
  if(!app)return;
  const sections=[...app.querySelectorAll(':scope > .section')];
  if(sections[0])sections[0].remove();
  const registrationCard=app.querySelector(':scope > .card');
  if(registrationCard)registrationCard.remove();
  const historyBtn=document.getElementById('historyBtn');
  if(historyBtn)historyBtn.remove();
  const history=document.getElementById('playerHistory');
  if(history){history.classList.remove('hidden');history.style.display='block'}
  const title=app.querySelector('h1');
  if(title)title.textContent='JOGADORES CADASTRADOS';
  if(typeof render==='function')render();
})();