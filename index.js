var fs = require('fs'),
	stdin = process.stdin,
	stdout = process.stdout;

stdout.write('Enter a path you want to list all files and directory: ');
stdin.resume();

// custom path
stdin.on('data', function (data) {
	var path = data.toString('utf8', 0, data.length);
	if(!path || 0 == path.length) {
		console.log('	\033[31mWrong path!\033[39m');
		return;
	}
	path = path.trim();
	fs.exists(path, function (exists) {
		if(exists) {
			listFiles(path);
		} else {
			stdout.write('	\033[31m' + path + ' is not existed!\nEnter a new path: \033[39m');
		}
	});
});
/**
 * list directory and file under path, and choice which directory or file will be show
 * @author baiyu
 * @date 2014-08-27
 */
function listFiles(path) {	
	fs.readdir(path, function (err, files) {
		console.log('');
		
		if(!files.length) {
			return console.log('	\033[31m No files to show!\033[39m\n');
		}
		
		console.log('	Select which file or directory you want to see\n');
		
		var stats = [];
		
		// called for each file walked in the directory
		function file(i) {
			var filename = files[i];
			// check path last charactor is or not '/'
			if(path.lastIndexOf('/') != (path.length - 1)) {
				path += '/';
			}
			
			fs.stat(path + filename, function (err, stat) {
				stats[i] = stat;
				
				if(stat && stat.isDirectory()) {
					console.log('	' + i + '	\033[36m' + filename + '/\033[39m');
				} else {
					console.log('	' + i + '	\033[90m' + filename + '\033[39m');
				}
				
				if(++i == files.length) {
					read();
				} else {
					file(i);
				}
			});
		}
		
		file(0);
		
		// read user input when files are shown
		function read() {
			console.log('');
			stdout.write('	\033[33mEnter your choice: \033[39m');
			stdin.resume();
			stdin.setEncoding('utf8');
			stdin.on('data', option);
		}
		
		// called with the option supplied by the user
		function option(data) {
			if(data.trim().toUpperCase() == "EXIT") {
				console.log('Bye! See you next time!');
				process.exit(0);
			}
			var filename = files[Number(data)];
			if(!filename) {
				stdout.write('	\033[31Enter your choice: \033[39m');
			} else {
				stdin.pause();
				if(stats[Number(data)].isDirectory()) {
					fs.readdir(path + '/' + filename, function (err, files) {
						console.log('');
						console.log('	(' + files.length + ' files)');
						files.forEach(function (file) {
							console.log('	-	' + file);
						});
						console.log('');
					});
				} else {
					fs.readFile(path + '/' + filename, 'utf8', function (err, data) {
						console.log('');
						console.log('\033[90m' + data.replace(/(.*)/g, '	$1') + '\033[39m');
					});
				}
				setTimeout(function () {
					console.log('	Select which file or directory you want to see\n');
					for(var i = 0, max = stats.length; i < max; i++) {
						if(stats[i] && stats[i].isDirectory()) {
							console.log('	' + i + '	\033[36m' + files[i] + '/\033[39m');
						} else {
							console.log('	' + i + '	\033[90m' + files[i] + '\033[39m');
						}
					}
					stdout.write('	\033[33mEnter your choice: \033[39m');
					stdin.resume();
				}, 1000);
			}
		}
	});
}
