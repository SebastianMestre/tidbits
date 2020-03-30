
There are some simple ways to model pandemics based on differential equations.

This repo contains some of those models, along with an interactive graph to play around with different values.

[Check it out](https://sebastianmestre.github.io/simple-pandemic-models/src)

![Screenshot of the program](./img/img1.png)

Red line represents exponential growth

Green line represents logistic growth

The other three lines show the SIR model: The blue line shows (S)usceptible population, the purple line shows the (I)nfected population, and the cyan line shows the (R)emoved population.

### Warning

This project uses Javascript modules, so your browser may not support them.

Even if it does support them, it might not be able to load the code due to CORS policies. You may need to spin up a server with access to the contents of this repo once you download them.

There are many ways to spin up a server in a particular directory. Here are some of them:

```shell
php -S localhost:3000 # requires php >= 5.4.0

serve 9000 # requires ruby >= 1.9.3, install `serve` with `gem install serve`
```

You can find more in this website: [askubuntu.com](https://askubuntu.com/questions/377389/how-to-easily-start-a-webserver-in-any-folder)
