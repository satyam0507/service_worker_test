var notify_config = {
   defaultHandler: "networkOnly",
   navigationFallback: '/offline',
   enable:true,
   cache: {
       name: "sw-test", //@ string
       maxAge: 604800, //@ number in sec
       maxLimit: 10000 //@ number in sec
   },
   urls: {
       '/(.*)': {
           handler: 'networkFirst', // @ string
       }
   },
   preCache: [
       "/", "/offline"
   ],
   staticFiles: [
       {
           urlPattern: '/(.*)/*.jpg'
       }
   ]


};