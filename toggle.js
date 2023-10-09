//TOGGLE BUTTON// 

const checkbox = document.querySelector('#check');
const html = document.querySelector('html');


const toggleDarkMode = () => {
    checkbox.checked
    ? html.classList.add('dark')
    : html.classList.remove('dark');
    
}

toggleDarkMode();
checkbox.addEventListener("click", toggleDarkMode);