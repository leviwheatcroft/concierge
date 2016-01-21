### compiling docs

you'll need `docker`: `npm install -g docker`

docker -u -o ./docs -x test,testStock,node_modules,notes,docs

be careful to -x anything you don't want.
