const path = require('path');

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
			  data: '@import "' + path.resolve(__dirname, 'src/components/App/css/theme.scss') + '";'
		  }
	  }
  },
  karma: {
	  tests: 'tests/**/**/*.test.js'
  }
}
