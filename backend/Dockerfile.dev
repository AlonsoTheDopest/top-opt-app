FROM julia:1.11.6
RUN apt-get update && apt-get install -y vim
RUN useradd --create-home --shell /bin/bash genie
RUN mkdir /home/genie/app
COPY . /home/genie/app
WORKDIR /home/genie/app
RUN chown -R genie:genie /home/
USER genie
EXPOSE 8000
EXPOSE 80
ENV JULIA_DEPOT_PATH="/home/genie/.julia"
ENV JULIA_REVISE="on"
ENV GENIE_ENV="dev"
ENV GENIE_HOST="0.0.0.0"
ENV PORT="8000"
ENV WSPORT="8000"
ENV EARLYBIND="true"
ENV JULIA_CPU_TARGET="generic"
RUN julia -e "using Pkg; Pkg.activate(\".\"); Pkg.instantiate(); Pkg.precompile(); "
ENTRYPOINT ["julia", "--project", "-e", "using Genie; Genie.loadapp(); up(async=false);"]
