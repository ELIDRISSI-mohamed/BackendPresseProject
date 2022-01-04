class Collaborateur {
    constructor(username, mail, password, competence){
        this.username  = username;
        this.mail = mail,
        this.password = password,
        this.competence = competence,
        this.role = "collaborateur",
        this.status = "NOT_VERIFIED",
        this.resetLink=""
    }
} 


module.exports = Collaborateur;