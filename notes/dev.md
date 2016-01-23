### compiling docs

you'll need `docker`: `npm install -g docker`

docker -o ./docs -x test,testOut,node_modules,notes,docs,.git

be careful to -x anything you don't want.
