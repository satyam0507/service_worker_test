var notify_config = {
   defaultHandler: "networkOnly",
   navigationFallback: '/offline',
   enable:true,
   debug:true,
   cache: {
       name: "sw-test", //@ string
       maxAge: 4*60, //@ number in sec
       maxLimit: 10000 //@ number in sec
   },
   urls: {
       '/(.*)': {
           handler: 'cacheFirst', // @ string
       }
   },
   preCache: [
       "/", "/offline"
   ],
   staticFiles: [
       {
           urlPattern: '/(.*)/*.jpg'
       },
       {
           origin:"https://s3.amazonaws.com",
           urlPattern:'/(.*)',
           maxAge:3*60
       }
   ]


};