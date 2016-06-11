const path = require('path');
const unixPath =  path.resolve(__dirname, 'src/components/App/css/theme.scss');
const winPath = 'C:/Users/bshen/Documents/Development/nwb-spa/src/components/App/css/theme.scss';
// const winPath = `${__dirname}/src/components/App/css/theme.scss`;

module.exports = {
  type: 'react-app',
  babel: {
	  stage:0
  },
  webpack: {
	  compat: {
		  enzyme: true,
		  sinon: true
	  },
	  extra: {
		  resolve: {
			  extensions: ['', '.js', '.jsx', '.scss', '.css'],
			  modulesDirectories: ['src', 'node_modules']
		  },
		  module: {
			  loaders: [
				  {
					test: /\.scss$/,
					loader: 'style!css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass?sourceMap'
				  }
			  ]
		  },
		  sassLoader: {
			  // data: '@import "' + + '";'
        data: `@import "${process.platform === 'win32' ? winPath : unixPath}";`
		  }
	  }
  },
  karma: {
	  tests: 'tests/**/**/*.test.js'
  }
}
