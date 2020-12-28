/**
 * Unique Id generator
 * length must be greater or equal to 1
 * @param {Number} len (default=5) the length of Id to generate
 * @returns Module itself
 */
function IDGENERATOR(len = 5) {
    this.ABOUT = {
        Version: "1.0.0",
        desc: "Unique Id generator",
        Author: "Harerimana Egide",
        Created: "25 Nov 2020",
        Updated: "latest version"
    };
    this.newID = "";
    len<=0 || typeof len != "number"? this.ID_LENGTH=5 : this.ID_LENGTH=len;
    this.ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return this
};

/* ID Prototype Functions
============================*/
IDGENERATOR.prototype = {
    /**
     * Generate a new ID
     * @returns {String} new unique ID
     */
    generate(){
        for (var i = 0; i < this.ID_LENGTH; i++) {
            this.newID += this.ALPHABET.charAt(Math.floor(Math.random() * this.ALPHABET.length));
        }
        return this.newID.toUpperCase();
    }
};

/**
 * Unique Id generator
 * length must be greater or equal to 1
 * @param {Number} len (default=5) the length of Id to generate
 * @returns id generator
 */
const ID = (len)=>{
    return new IDGENERATOR(len)
}
module.exports =  ID