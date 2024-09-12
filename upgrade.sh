cd
mv Snyivot/ tmp/
git clone https://github.com/Snyiv495/Snyivot.git
mv tmp/node_module Snyivot/
mv tmp/.env Snyivot/
mv tmp/db.sqlite Snyivot/
sudo rm -r tmp/
cd Snyivot/
pm2 start src/index.js