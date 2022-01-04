class Admin {
    constructor(username, mail, password){
        this.username  = username;
        this.mail = mail,
        this.password = password,
        this.role = "admin",
        this.status = "NOT_VERIFIED",
        this.resetLink=""
    }
} 


module.exports = Admin;