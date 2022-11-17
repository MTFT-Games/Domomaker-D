const helper = require('./helper.js');

const handleReset = (e) => {
    e.preventDefault();
    helper.hideError();

    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const pass3 = e.target.querySelector('#pass3').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!pass || !pass2 || !pass3) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass2 !== pass3) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { pass, pass2, pass3, _csrf });
    return false;
};

const ResetWindow = (props) => {
    return (
        <form id='resetForm'
            name='resetForm'
            onSubmit={handleReset}
            action="/pass-reset"
            method='POST'
            className='resetForm'
        >
            <label htmlFor="pass">Old password: </label>
            <input type="password" name="pass" id="pass" placeholder='old password' />
            <label htmlFor="pass2">New password: </label>
            <input type="password" name="pass2" id="pass2" placeholder='new password' />
            <label htmlFor="pass3">Retype new password: </label>
            <input type="password" name="pass3" id="pass3" placeholder='retype new pass' />
            <input type="hidden" name="_csrf" id="_csrf" value={props.csrf} />
            <input type="submit" className='resetSubmit' value="Reset password" />
        </form>
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(<ResetWindow csrf={data.csrfToken} />,
        document.getElementById('content'));
};

window.onload = init;