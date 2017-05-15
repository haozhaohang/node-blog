var mongoose = require( 'mongoose' );
var labelsSchema = require( '../schemas/label' );

module.exports = mongoose.model( 'Lable', labelsSchema );