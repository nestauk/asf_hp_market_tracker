# Creating the hook on the remote server

Create a bare git repo:

```sh
mkdir asf_hp_market_tracker.git
cd asf_hp_market_tracker.git
git init --bare
```

Create post-receive hook file

```sh
cd hooks
touch post-receive
```

Copy contents of [post-receive](./post-receive) to this file. 

Please make sure that you:
- Update the `branch` variable to reflect which one the remote is, i.e. either
  `dev` or `staging`

Then make executable:

```
sudo chmod +x post-receive
```

Clone the bare repo:

```
cd $HOME
git clone asf_hp_market_tracker.git
```

# On the client

Create the dev remote and push the dev/staging branch to the server.
Example for dev server:

```sh
git remote add dev ubuntu@hpmt.be.dev.dap-tools.uk:/home/ubuntu/asf_hp_market_tracker.git
git push dev dev
```

# Back on the server

cd to the repository (not the bare one, i.e. not the directory ending in `.git`)

`cd asf_hp_market_tracker`

Pull, then switch to dev

```sh
git pull
git checkout dev --force
```

# Install pm2 globally

**N.B** Make sure npm and node are installed on the server before the next
step. The easiest way is to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

`npm install -g pm2`

The G.H. action should take care of the rest.


