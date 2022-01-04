class User {
    constructor(username, mail, password){
        this.username  = username;
        this.mail = mail,
        this.password = password,
        this.role = "user",
        this.status = "NOT_VERIFIED",
        this.resetLink=""
    }
} 


module.exports = User;