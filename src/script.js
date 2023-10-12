/*********************** Import ***********************/
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from "gsap";
import { ScrollTrigger } from '../node_modules/gsap/ScrollTrigger.js';
import ASScroll from '@ashthornton/asscroll';
/******************************************************/



/****************** Global Variables ******************/
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
var room;
var cube;
var actualDevice;
let moveFlag = false;
let boxLetter = false;
let page2Load = false;
/******************************************************/



/***************** Calling functions ******************/
init();
// ASScrollXGSAPScrollTrigger();
loadCube()
loadRoom();
createUnivers();
/******************************************************/



/********************* Functions **********************/
function init() {
    scene.background = new THREE.Color('#0e103d');
    dracoLoader.setDecoderPath('draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    gsap.registerPlugin(ScrollTrigger);
    if(window.innerWidth < 968) {
        actualDevice = "mobile";
    } else {
        actualDevice = "desktop";
    }
}

function defineDevice(width, actualDevice) {
    var device;
    if (width < 968 && actualDevice !== "mobile") {
      device = "mobile";
    } 
    if (width >= 968 && actualDevice !== "desktop") {
      device = "desktop";
    }
    return device;
}

function appearP2() { 
    var page1 = document.getElementById('page1');
    var page2 = document.getElementById('page2');
    page1.style.display = "none";
    page2.style.display = 'block';
}

function ASScrollXGSAPScrollTrigger() {
    // https://github.com/ashthornton/asscroll
    const asscroll = new ASScroll({
        disableRaf: true
    });
    gsap.ticker.add(asscroll.update);

    ScrollTrigger.defaults({
        scroller: asscroll.containerElement
    });

    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
        scrollTop(value) {
            return arguments.length ? asscroll.currentPos = value : asscroll.currentPos;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
        }
    });

    asscroll.on("update", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", asscroll.resize);

    window.addEventListener("load", () => {
        asscroll.enable();
    });
}

function loadCube() {
    gltfLoader.load('cube.glb', function (gltf) {
        cube = gltf.scene;
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(0, 0.15, 0);
        cube.scale.set(0.2, 0.2, 0.2);
        scene.add(cube);
    });
}

function loadRoom() {
    gltfLoader.load('room_prototype.glb', function (gltf) {
        room = gltf.scene;
        room.children.forEach((child) => {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child instanceof THREE.Group) {
            child.children.forEach((groupChild) => {
              groupChild.castShadow = true;
              groupChild.receiveShadow = true;
            });
          }

          if (child.name === "mini_platform" || child.name === "mailbox" || child.name === "tile1" || child.name === "tile2" || child.name === "tile3") {
            child.position.y = 100;
          }
        });
        room.position.set(0, 0.15, 0);
        room.scale.set(0.010, 0.010, 0.010);
        scene.add(room);
    });
}

function createUnivers() {
    if (cube && room) {
        /*********************** Sizes ************************/
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        window.addEventListener('resize', () =>
        {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Check device
            actualDevice = defineDevice(sizes.width, actualDevice);

            // Update camera
            perspectiveCameraPOV.aspect = sizes.width / sizes.height;
            perspectiveCameraPOV.updateProjectionMatrix();
            if(moveFlag) {
                move();
            }

            // Update renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        })
        /******************************************************/



        /*********************** Camera ***********************/
        // Perspective Camera (global)
        const perspectiveCameraGlobal = new THREE.PerspectiveCamera(
            45, 
            sizes.width / sizes.height, 
            0.1, 
            100);
        perspectiveCameraGlobal.position.set(5, 5, 5);
        scene.add(perspectiveCameraGlobal);

        // Perspective Camera (POV)
        const perspectiveCameraPOV = new THREE.PerspectiveCamera(
            45, 
            sizes.width / sizes.height, 
            0.1, 
            10);
        perspectiveCameraPOV.position.set(0, 0.70, 1.75);
        perspectiveCameraPOV.rotation.x = -Math.PI / 12;
        scene.add(perspectiveCameraPOV);

        // Controls
        const controls = new OrbitControls(perspectiveCameraGlobal, canvas);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        /******************************************************/



        /********************** Renderer **********************/
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.CineonToneMapping;
        renderer.toneMappingExposure = 1.5;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        /******************************************************/



        /*********************** Lights ***********************/
        // Desk light
        const targetDeskLight = new THREE.Object3D(); // Target
        targetDeskLight.position.set(-0.13,-0.18,-0.21);
        scene.add(targetDeskLight);
        const deskLight = new THREE.SpotLight('#ffffff', 1); // Light
        deskLight.distance = 1.5;
        deskLight.angle = Math.PI/7;
        deskLight.penumbra = 0.3;
        deskLight.castShadow = true;
        deskLight.shadow.camera.far = 5;
        deskLight.shadow.mapSize.set(2048, 2048);
        deskLight.shadow.normalBias = 0.05;
        deskLight.target = targetDeskLight;
        deskLight.position.set(-0.28, 0.57, 0.21);
        scene.add(deskLight);

        // Moon light
        const targetMoonLight = new THREE.Object3D(); // Target
        targetMoonLight.position.set(0.651,0.365,1.248);
        scene.add(targetMoonLight);
        const moonLight = new THREE.DirectionalLight('#dcdfff', 2); // Light
        moonLight.castShadow = true;
        moonLight.shadow.camera.far = 5;
        moonLight.shadow.mapSize.set(8192, 8192);
        moonLight.shadow.normalBias = 0.05;
        moonLight.target = targetMoonLight;
        moonLight.position.set(-1.793, 0.703, 0.599);
        scene.add(moonLight);

        // Ambient light (add some life to the scene)
        const ambientLight = new THREE.AmbientLight('#dcdfff', 0.5);
        scene.add(ambientLight);

         // Point light for mailbox
         const pointLight = new THREE.PointLight('#dcdfff', 0.25, 3);
         pointLight.position.set(50, 50, 50);
         scene.add(pointLight);
        /******************************************************/



        /********************* 3D object **********************/
        // Circles
        const geometry_circle = new THREE.CircleGeometry(5, 64);
        const material_circle1 = new THREE.MeshStandardMaterial({ color: 0x0a1838 });
        const material_circle2 = new THREE.MeshStandardMaterial({ color: 0x14243e });
        const material_circle3 = new THREE.MeshStandardMaterial({ color: 0x385b84 });
       
        const circleFirst = new THREE.Mesh(geometry_circle, material_circle1);
        const circleSecond = new THREE.Mesh(geometry_circle, material_circle2);
        const circleThird = new THREE.Mesh(geometry_circle, material_circle3);

        circleFirst.position.y = -0.29;
        circleFirst.position.z = -1;

        circleSecond.position.x = 2;
        circleSecond.position.y = -0.28;
        circleSecond.position.z = -1;
        
        circleThird.position.y = -0.27;
        circleThird.position.z = -1;

        circleFirst.scale.set(0, 0, 0);
        circleSecond.scale.set(0, 0, 0);
        circleThird.scale.set(0, 0, 0);

        circleFirst.rotation.x =
        circleSecond.rotation.x =
        circleThird.rotation.x =
            -Math.PI / 4;

        scene.add(circleFirst);
        scene.add(circleSecond);
        scene.add(circleThird);
        /******************************************************/



        /********************* Preloader **********************/
        function setAssets() {
            convertDivsToSpans(document.querySelector(".intro-text"));
            convertDivsToSpans(document.querySelector(".hero-main-title"));
            convertDivsToSpans(document.querySelector(".hero-main-description"));
            convertDivsToSpans(document.querySelector(".second-des"));
            convertDivsToSpans(document.querySelector(".hero-second-subheading"));
            convertDivsToSpans(document.querySelector(".second-sub"));
        }

        function convertDivsToSpans(element) {
            element.style.overflow = "hidden";
            element.innerHTML = element.innerText
                .split("")
                .map((char) => {
                    if(char === " ") {
                        return `<span>&nbsp;</span>`;
                    }
                    return `<span class="animatedis">${char}</span>`;
                })
                .join("");
            return element;
        }

        function onScroll(event) {
            if (event.deltaY > 0) {
                removeEventListeners();
                playSecondIntro();
            }
        }

        function onTouch(event) {
            initialY = event.touches[0].clientY;
        }

        function onTouchMove(event) {
            let currentY = event.touches[0].clientY;
            let difference = initialY - currentY;
            if(difference > 0) {
                removeEventListeners();
                playSecondIntro();
            }
            initialY = null;
        }

        function removeEventListeners() {
            window.removeEventListener("wheel", onScroll);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("touchmove", onTouchMove);
        }

        function move() {
            if(actualDevice === "desktop"){
                perspectiveCameraPOV.position.set(0.75, 0 ,0);
            } else {
                perspectiveCameraPOV.position.set(0, 0, 0.75);
            }
        }

        function firstIntro() {
            return new Promise((resolve) => {
                const firstTimeline = new gsap.timeline();
                firstTimeline.to(".preloader", {
                    opacity: 0,
                    delay: 2,
                    onComplete: () => {
                        document.querySelector(".preloader").classList.add("hidden");
                    }
                });

                if(actualDevice === "desktop") {
                    firstTimeline.to(cube.scale, {
                        x: 0.11,
                        y: 0.11,
                        z: 0.11,
                        ease: "back.out(2.5)",
                        duration: 1
                    })
                    .to(cube.position, {
                        x: -0.5,
                        ease: "power1.out",
                        duration: 1
                    }, "same")
                    .to(room.position, {
                        x: -0.5,
                        ease: "power1.out",
                        duration: 1
                    }, "same");
                } else {
                    firstTimeline.to(cube.scale, {
                        x: 0.1,
                        y: 0.1,
                        z: 0.1,
                        ease: "back.out(2.5)",
                        duration: 1
                    })
                    .to(cube.position, {
                        z: -0.5,
                        ease: "power1.out",
                        duration: 1
                    }, "same")
                    .to(room.position, {
                        z: -0.5,
                        ease: "power1.out",
                        duration: 1
                    }, "same");
                }
                firstTimeline.to(".intro-text .animatedis", {
                    yPercent: -100,
                    stagger: 0.04,
                    ease: "back.out(2.5)"
                })
                .to(".arrow-svg-wrapper",{
                    opacity: 1,
                    onComplete: resolve
                });
            });
        }

        function secondIntro() {
            const secondTimeline = new gsap.timeline();
            secondTimeline.to(".intro-text .animatedis", {
                yPercent: 100,
                stagger: 0.04,
                ease: "back.in(0.5)"
            }, "start")
            .to(".arrow-svg-wrapper",{
                opacity: 0
            }, "start")
            .to(cube.rotation, {
                y: 2 * Math.PI,
                duration: 1
            }, "same")
            .to(cube.scale, {
                x: 0.49,
                y: 0.49,
                z: 0.49,
                duration: 1
            }, "same")
            .to(cube.position, {
                x: 0.02,
                y: 0.05,
                z: 0.05,
                duration: 1
            }, "same")
            .to(room.position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1
            }, "same")
            .to(room.scale, {
                x: 0.1,
                y: 0.1,
                z: 0.1,
                duration: 1
            }, "cube")
            .to(cube.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                onComplete: function() {
                    appearP2();
                    page2Load = true;
                }
            }, "cube")
            .to(".hero-main-title .animatedis", {
                yPercent: -100,
                stagger: 0.04,
                ease: "back.out(0.5)"
            }, "text")
            .to(".hero-main-description .animatedis", {
                yPercent: -100,
                stagger: 0.04,
                ease: "back.out(0.5)"
            }, "text")
            .to(".second-des .animatedis", {
                yPercent: -100,
                stagger: 0.04,
                ease: "back.out(0.5)"
            }, "text")
            .to(".hero-second-subheading .animatedis", {
                yPercent: -100,
                stagger: 0.04,
                ease: "back.out(0.5)"
            }, "text")
            .to(".second-sub .animatedis", {
                yPercent: -100,
                stagger: 0.04,
                ease: "back.out(0.5)"
            }, "text")
            .to(".arrow-svg-wrapper",{
                opacity: 1
            });
        }

        async function playFirstIntro() {
            await firstIntro();
            moveFlag = true;
            alert("Updates are in progress with the possibility of consulting the code or the final result of my various works");
            window.addEventListener("wheel", onScroll);
            window.addEventListener("touchstart", onTouch);
            window.addEventListener("touchmove", onTouchMove);
        }

        async function playSecondIntro() {
            moveFlag = false;
            await secondIntro();
        }

        var initialY;
        setAssets();
        playFirstIntro();
        /******************************************************/



        /******************* Scrolltrigger ********************/
        // Fix bug on mobile
        document.querySelector(".page2").style.overflow = "visible";

        function scrollAnimation () {
            if(page2Load) {
                ScrollTrigger.matchMedia({
                    // Desktop
                    "(min-width: 969px)": () => {
    
                        /*************** First section ***************/
                        const firstMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".first-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        firstMoveTimeline.to(room.position, {
                            x: () => {
                                return sizes.width*0.0004;
                            },
                            onComplete: () => {
                                boxLetter = false;
                            }
                        }, "same")
                        .to(deskLight.position, {
                            x: () => {
                                return sizes.width*0.0002;
                            }
                        }, "same")
                        .to(targetDeskLight.position, {
                            x: () => {
                                return sizes.width*0.00035;
                            }
                        }, "same");
        
                        /************** Second section ***************/
                        const secondMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".second-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        secondMoveTimeline.to(perspectiveCameraPOV.position, {
                            x: 0.7,
                            y: 1.15,
                            z: 0.7,
                            onComplete: () => {
                                boxLetter = false;
                            }
                        }, "same")
                        .to(deskLight.position, {
                            x: 0.4,
                            y: 1.25,
                            z: 0.15
                        }, "same")
                        .to(targetDeskLight.position, {
                            x: 0.3,
                            y: 0.2,
                            z: -0.25
                        }, "same");
    
                        /*************** Third section ***************/
                        const thirdMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".third-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        thirdMoveTimeline.to(perspectiveCameraPOV.position, {
                            x: 0.3,
                            y: 1.05,
                            z: 1,
                            onComplete: () => {
                                boxLetter = true
                            }
                        }, "same")
                        .to(perspectiveCameraPOV.rotation, {
                            x: -Math.PI / 6
                        }, "same")
                        .to(pointLight.position, {
                            x: 0.7,
                            y: 0.8,
                            z: 0.9
                        }, "same");
                    },
    
                    // Mobile
                    "(max-width: 968px)": () => {
    
                        /*************** First section ***************/
                        const firstMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".first-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        firstMoveTimeline.to(room.scale, {
                            x: 0.085,    
                            y: 0.085,
                            z: 0.085,
                            onComplete: () => {
                                boxLetter = false;
                            }
                        }, "same")
                        .to(deskLight.position, {
                            x: -0.23,
                            y: 0.47,
                            z: 0.16
                        }, "same");
    
                        /************** Second section ***************/
                        const secondMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".second-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        secondMoveTimeline.to(perspectiveCameraPOV.position, {
                            x: -0.2,
                            y: 1.05,
                            z: 0.6,
                            onComplete: () => {
                                boxLetter = false;
                            }
                        }, "same")
                        .to(deskLight.position, {
                            x: -0.23,
                            y: 1.2,
                            z: 0.16
                        }, "same")
                        .to(targetDeskLight.position, {
                            x: 0,
                            y: 0.2,
                            z: -0.4
                        }, "same");
        
                        /*************** Third section ***************/
                        const thirdMoveTimeline = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".third-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        thirdMoveTimeline.to(perspectiveCameraPOV.position, {
                            x: 0,
                            y: 1,
                            z: 0.8,
                            onComplete: () => {
                                boxLetter = true;
                            }
                        }, "same")
                        .to(perspectiveCameraPOV.rotation, {
                            x: -Math.PI / 6
                        }, "same")
                        .to(pointLight.position, {
                            x: 0,
                            y: 0.95,
                            z: 0.5
                        }, "same");
                    },
        
                    "all": () => {
                        // Progress bar
                        const sections = document.querySelectorAll(".section");
                        sections.forEach((event) => {
                            const progressWrapper = event.querySelector(".progress-wrapper");
                            const progressBar = event.querySelector(".progress-bar");
        
                            if (event.classList.contains("right")) {
                                gsap.to(event, {
                                    borderTopLeftRadius: 10,
                                    scrollTrigger: {
                                        trigger: event,
                                        start: "top bottom",
                                        end: "top top",
                                        scrub: 0.6
                                    }
                                });
                                gsap.to(event, {
                                    borderBottomLeftRadius: 700,
                                    scrollTrigger: {
                                        trigger: event,
                                        start: "bottom bottom",
                                        end: "bottom top",
                                        scrub: 0.6
                                    }
                                });
                            } else {
                                gsap.to(event, {
                                    borderTopRightRadius: 10,
                                    scrollTrigger: {
                                        trigger: event,
                                        start: "top bottom",
                                        end: "top top",
                                        scrub: 0.6
                                    }
                                });
                                gsap.to(event, {
                                    borderBottomRightRadius: 700,
                                    scrollTrigger: {
                                        trigger: event,
                                        start: "bottom bottom",
                                        end: "bottom top",
                                        scrub: 0.6
                                    }
                                });
                            }
                            gsap.from(progressBar, {
                                scaleY: 0,
                                scrollTrigger: {
                                    trigger: event,
                                    start: "top top",
                                    end: "bottom bottom",
                                    scrub: 0.4,
                                    pin: progressWrapper,
                                    pinSpacing: false
                                }
                            });
                        });
        
                        // Circles
                        /*************** First section ***************/
                        const firstCircle = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".first-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6
                            }
                        }).to(circleFirst.scale, {
                            x: 3,
                            y: 3,
                            z: 3
                        });
                        
                        /************** Second section ***************/
                        const secondCircle = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".second-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6
                            }
                        })
                        .to(circleSecond.scale, {
                            x: 3,
                            y: 3,
                            z: 3
                        }, "same")
                        .to(room.position, {
                            y: 0.7
                        }, "same");
        
                        /*************** Third section ***************/
                        const thirdCircle = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".third-move",
                                start: "top top",
                                end: "bottom bottom",
                                scrub: 0.6
                            }
                        }).to(circleThird.scale, {
                            x: 3,
                            y: 3,
                            z: 3
                        });
        
                        // Mini platform animation
                        const secondPartTimeline  = new gsap.timeline({
                            scrollTrigger: {
                                trigger: ".third-move",
                                start: "center center",
                                end: "bottom bottom",
                                scrub: 0.6,
                                invalidateOnRefresh: true
                            }
                        });
                        room.children.forEach((child) => {
                            if(child.name === "mini_platform" || child.name === "mailbox" || child.name === "tile1" || child.name === "tile2" || child.name === "tile3") {
                                secondPartTimeline.to(child.position, {
                                    y: 0.2,
                                    duration: 10
                                });
                            }
                        });
                    }          
                });
            } else {
                setTimeout(scrollAnimation, 200)
            }
        }

        scrollAnimation()
        /******************************************************/



        /********************** Animate ***********************/
        let lerp = {
            current: 0,
            target: 0,
            ease: 0.1,
        }
        var rotation;

        window.addEventListener("mousemove", onMouseMove, {passive: true});
        function onMouseMove(event) {
            rotation = ((event.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
            if(boxLetter) {
                lerp.target = rotation * 0.02;
            } else {
                lerp.target = rotation * 0.2;
            }
        }

        function modifyObjectRotation() {
            lerp.current = lerp.current + (lerp.target - lerp.current) * lerp.ease;
            cube.rotation.y = lerp.current;
            room.rotation.y = lerp.current;
        }

        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            controls.update();
            renderer.render(scene, perspectiveCameraPOV);

            modifyObjectRotation();
            
            window.requestAnimationFrame(tick);
        }

        tick();
        /*******************************************************/
    } else {
        setTimeout(createUnivers, 100);
    }
}
/******************************************************/
