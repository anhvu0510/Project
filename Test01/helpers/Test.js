const _ = require('lodash')
const async = require('async');
const sendMail = require('./mailHelper')


async.auto({
    get_data: function(callback) {
        console.log('in get_data');
        // async code to get some data
        callback(null, 'data', 'converted to array');
    },
    make_folder: function(callback) {
        console.log('in make_folder');
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        callback(null, 'folder');
    },
    write_file: ['get_data', 'make_folder', function(results, callback) {
        console.log('in write_file', JSON.stringify(results));
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        callback(null, 'filename');
    }],
    email_link: ['write_file', function(results, callback) {
        console.log('in email_link', JSON.stringify(results));
        // once the file is written let's email a link to it...
        // results.write_file contains the filename returned by write_file.
        callback(null, {'file':results.write_file, 'email':'user@example.com'});
    }]
}, function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
});


//  The example from `auto` can be rewritten as follows:
async.autoInject({
    get_data: function(callback) {
        // async code to get some data
        console.log('Get_data')
        callback(null, 'data', 'converted to array');
    },
    make_folder: function(callback) {
        console.log('Make_folder')
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        callback(null, 'folder');
    },
    write_file: function(get_data, make_folder, callback) {
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        console.log('Write Folder')
        callback(null, 'filename');
    },
    email_link: function(write_file, callback) {
        // once the file is written let's email a link to it...
        // write_file contains the filename returned by write_file.
        console.log('Email Link')
        callback(null, {'file':write_file, 'email':'user@example.com'});
    }
}, function(err, results) {
    console.log('err = ', err);
    console.log('email_link = ', results.email_link);
});


console.log('Running.....')
