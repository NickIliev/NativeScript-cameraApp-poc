Object.defineProperty(exports, "__esModule", { value: true });
var transition_1 = require("../transition/transition");
var slide_transition_1 = require("../transition/slide-transition");
var fade_transition_1 = require("../transition/fade-transition");
var flip_transition_1 = require("../transition/flip-transition");
var animation_1 = require("../animation");
var platform_1 = require("../../platform");
var lazy_1 = require("../../utils/lazy");
var trace_1 = require("../../trace");
var CALLBACKS = "_callbacks";
var sdkVersion = lazy_1.default(function () { return parseInt(platform_1.device.sdkVersion); });
var intEvaluator = lazy_1.default(function () { return new android.animation.IntEvaluator(); });
var defaultInterpolator = lazy_1.default(function () { return new android.view.animation.AccelerateDecelerateInterpolator(); });
var waitingQueue = new Set();
var TransitionListener;
var AnimationListener;
var loadAnimatorMethod;
var reflectionDone;
var defaultEnterAnimatorStatic;
var defaultExitAnimatorStatic;
var fragmentCompleted;
function _setAndroidFragmentTransitions(animated, navigationTransition, currentFragment, newFragment, fragmentTransaction, manager) {
    if (waitingQueue.size > 0) {
        throw new Error('Calling navigation before previous queue completes.');
    }
    if (sdkVersion() >= 21) {
        allowTransitionOverlap(currentFragment);
        allowTransitionOverlap(newFragment);
    }
    var name = '';
    var transition;
    if (navigationTransition) {
        transition = navigationTransition.instance;
        name = navigationTransition.name ? navigationTransition.name.toLowerCase() : '';
    }
    var useLollipopTransition = name && (name.indexOf('slide') === 0 || name === 'fade' || name === 'explode') && sdkVersion() >= 21;
    if (!animated) {
        name = 'none';
    }
    else if (transition) {
        name = 'custom';
        useLollipopTransition = false;
    }
    else if (!useLollipopTransition && name.indexOf('slide') !== 0 && name !== 'fade' && name.indexOf('flip') !== 0) {
        name = 'default';
    }
    var callbacks = getFragmentCallbacks(newFragment);
    var newEntry = callbacks.entry;
    var currentEntry = currentFragment ? getFragmentCallbacks(currentFragment).entry : null;
    var currentFragmentNeedsDifferentAnimation = false;
    if (currentEntry) {
        _updateTransitions(currentEntry);
        if (currentEntry.transitionName !== name
            || currentEntry.transition !== transition) {
            clearExitAndReenterTransitions(currentEntry, true);
            currentFragmentNeedsDifferentAnimation = true;
        }
    }
    if (name === 'none') {
        transition = new NoTransition(0, null);
    }
    else if (name === 'default') {
        initDefaultAnimations(manager);
        transition = new DefaultTransition(0, null);
    }
    else if (useLollipopTransition) {
        if (name.indexOf('slide') === 0) {
            setupNewFragmentSlideTransition(navigationTransition, newEntry, name);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentSlideTransition(navigationTransition, currentEntry, name);
            }
        }
        else if (name === 'fade') {
            setupNewFragmentFadeTransition(navigationTransition, newEntry);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentFadeTransition(navigationTransition, currentEntry);
            }
        }
        else if (name === 'explode') {
            setupNewFragmentExplodeTransition(navigationTransition, newEntry);
            if (currentFragmentNeedsDifferentAnimation) {
                setupCurrentFragmentExplodeTransition(navigationTransition, currentEntry);
            }
        }
    }
    else if (name.indexOf('slide') === 0) {
        var direction = name.substr('slide'.length) || 'left';
        transition = new slide_transition_1.SlideTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }
    else if (name === 'fade') {
        transition = new fade_transition_1.FadeTransition(navigationTransition.duration, navigationTransition.curve);
    }
    else if (name.indexOf('flip') === 0) {
        var direction = name.substr('flip'.length) || 'right';
        transition = new flip_transition_1.FlipTransition(direction, navigationTransition.duration, navigationTransition.curve);
    }
    newEntry.transitionName = name;
    if (name === 'custom') {
        newEntry.transition = transition;
    }
    if (transition) {
        fragmentTransaction.setCustomAnimations(-10, -20, -30, -40);
        setupAllAnimation(newEntry, transition);
        if (currentFragmentNeedsDifferentAnimation) {
            setupExitAndPopEnterAnimation(currentEntry, transition);
        }
    }
    if (currentEntry) {
        currentEntry.transitionName = name;
        if (name === 'custom') {
            currentEntry.transition = transition;
        }
    }
    printTransitions(currentEntry);
    printTransitions(newEntry);
}
exports._setAndroidFragmentTransitions = _setAndroidFragmentTransitions;
function _onFragmentCreateAnimator(fragment, nextAnim) {
    var entry = getFragmentCallbacks(fragment).entry;
    switch (nextAnim) {
        case -10:
            return entry.enterAnimator;
        case -20:
            return entry.exitAnimator;
        case -30:
            return entry.popEnterAnimator;
        case -40:
            return entry.popExitAnimator;
    }
    return null;
}
exports._onFragmentCreateAnimator = _onFragmentCreateAnimator;
function _updateTransitions(entry) {
    var fragment = entry.fragment;
    var enterTransitionListener = entry.enterTransitionListener;
    if (enterTransitionListener) {
        fragment.setEnterTransition(enterTransitionListener.transition);
    }
    var exitTransitionListener = entry.exitTransitionListener;
    if (exitTransitionListener) {
        fragment.setExitTransition(exitTransitionListener.transition);
    }
    var reenterTransitionListener = entry.reenterTransitionListener;
    if (reenterTransitionListener) {
        fragment.setReenterTransition(reenterTransitionListener.transition);
    }
    var returnTransitionListener = entry.returnTransitionListener;
    if (returnTransitionListener) {
        fragment.setReturnTransition(returnTransitionListener.transition);
    }
}
exports._updateTransitions = _updateTransitions;
function _reverseTransitions(previousEntry, currentEntry) {
    var previousFragment = previousEntry.fragment;
    var currentFragment = currentEntry.fragment;
    var transitionUsed = false;
    if (sdkVersion() >= 21) {
        var returnTransitionListener = currentEntry.returnTransitionListener;
        if (returnTransitionListener) {
            transitionUsed = true;
            currentFragment.setExitTransition(returnTransitionListener.transition);
        }
        else {
            currentFragment.setExitTransition(null);
        }
        var reenterTransitionListener = previousEntry.reenterTransitionListener;
        if (reenterTransitionListener) {
            transitionUsed = true;
            previousFragment.setEnterTransition(reenterTransitionListener.transition);
        }
        else {
            previousFragment.setEnterTransition(null);
        }
    }
    return transitionUsed;
}
exports._reverseTransitions = _reverseTransitions;
function getFragmentCallbacks(fragment) {
    return fragment[CALLBACKS];
}
function getTransitionListener(entry, transition) {
    if (!TransitionListener) {
        var TransitionListenerImpl = (function (_super) {
            __extends(TransitionListenerImpl, _super);
            function TransitionListenerImpl(entry, transition) {
                var _this = _super.call(this) || this;
                _this.entry = entry;
                _this.transition = transition;
                return global.__native(_this);
            }
            TransitionListenerImpl.prototype.onTransitionStart = function (transition) {
                var fragment = this.entry.fragment;
                waitingQueue.add(fragment);
                if (trace_1.isEnabled()) {
                    trace_1.write("START " + toShortString(transition) + " transition for " + fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionEnd = function (transition) {
                var fragment = this.entry.fragment;
                if (trace_1.isEnabled()) {
                    trace_1.write("END " + toShortString(transition) + " transition for " + fragment, trace_1.categories.Transition);
                }
                transitionOrAnimationCompleted(fragment);
            };
            TransitionListenerImpl.prototype.onTransitionResume = function (transition) {
                if (trace_1.isEnabled()) {
                    var fragment = this.entry.fragment;
                    trace_1.write("RESUME " + toShortString(transition) + " transition for " + fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionPause = function (transition) {
                if (trace_1.isEnabled()) {
                    var fragment = this.entry.fragment;
                    trace_1.write("PAUSE " + toShortString(transition) + " transition for " + fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl.prototype.onTransitionCancel = function (transition) {
                if (trace_1.isEnabled()) {
                    var fragment = this.entry.fragment;
                    trace_1.write("CANCEL " + toShortString(transition) + " transition for " + fragment, trace_1.categories.Transition);
                }
            };
            TransitionListenerImpl = __decorate([
                Interfaces([android.transition.Transition.TransitionListener])
            ], TransitionListenerImpl);
            return TransitionListenerImpl;
        }(java.lang.Object));
        TransitionListener = TransitionListenerImpl;
    }
    return new TransitionListener(entry, transition);
}
function getAnimationListener() {
    if (!AnimationListener) {
        var AnimationListnerImpl = (function (_super) {
            __extends(AnimationListnerImpl, _super);
            function AnimationListnerImpl() {
                var _this = _super.call(this) || this;
                return global.__native(_this);
            }
            AnimationListnerImpl.prototype.onAnimationStart = function (animator) {
                var fragment = animator.entry.fragment;
                waitingQueue.add(fragment);
                if (trace_1.isEnabled()) {
                    trace_1.write("START " + animator.transitionType + " for " + fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl.prototype.onAnimationRepeat = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("REPEAT " + animator.transitionType + " for " + animator.entry.fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl.prototype.onAnimationEnd = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("END " + animator.transitionType + " for " + animator.entry.fragment, trace_1.categories.Transition);
                }
                transitionOrAnimationCompleted(animator.entry.fragment);
            };
            AnimationListnerImpl.prototype.onAnimationCancel = function (animator) {
                if (trace_1.isEnabled()) {
                    trace_1.write("CANCEL " + animator.transitionType + " for " + animator.entry.fragment, trace_1.categories.Transition);
                }
            };
            AnimationListnerImpl = __decorate([
                Interfaces([android.animation.Animator.AnimatorListener])
            ], AnimationListnerImpl);
            return AnimationListnerImpl;
        }(java.lang.Object));
        AnimationListener = new AnimationListnerImpl();
    }
    return AnimationListener;
}
function clearAnimationListener(animator, listener) {
    if (!animator) {
        return;
    }
    animator.removeListener(listener);
    var entry = animator.entry;
    var fragment = entry.fragment;
    if (trace_1.isEnabled()) {
        trace_1.write("Clear " + animator.transitionType + " - " + entry.transition + " for " + fragment, trace_1.categories.Transition);
    }
    animator.entry = null;
}
function clearExitAndReenterTransitions(entry, removeListener) {
    if (sdkVersion() >= 21) {
        var fragment = entry.fragment;
        var exitListener = entry.exitTransitionListener;
        if (exitListener) {
            var exitTransition = fragment.getExitTransition();
            if (exitTransition) {
                if (removeListener) {
                    exitTransition.removeListener(exitListener);
                }
                fragment.setExitTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Exit " + exitTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.exitTransitionListener = null;
            }
        }
        var reenterListener = entry.reenterTransitionListener;
        if (reenterListener) {
            var reenterTransition = fragment.getReenterTransition();
            if (reenterTransition) {
                if (removeListener) {
                    reenterTransition.removeListener(reenterListener);
                }
                fragment.setReenterTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Reenter " + reenterTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.reenterTransitionListener = null;
            }
        }
    }
}
function _clearFragment(fragment) {
    clearEntry(getFragmentCallbacks(fragment).entry, false);
}
exports._clearFragment = _clearFragment;
function _clearEntry(entry) {
    clearEntry(entry, true);
}
exports._clearEntry = _clearEntry;
function clearEntry(entry, removeListener) {
    clearExitAndReenterTransitions(entry, removeListener);
    if (sdkVersion() >= 21) {
        var fragment = entry.fragment;
        var enterListener = entry.enterTransitionListener;
        if (enterListener) {
            var enterTransition = fragment.getEnterTransition();
            if (enterTransition) {
                if (removeListener) {
                    enterTransition.removeListener(enterListener);
                }
                fragment.setEnterTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Enter " + enterTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.enterTransitionListener = null;
            }
        }
        var returnListener = entry.returnTransitionListener;
        if (returnListener) {
            var returnTransition = fragment.getReturnTransition();
            if (returnTransition) {
                if (removeListener) {
                    returnTransition.removeListener(returnListener);
                }
                fragment.setReturnTransition(null);
                if (trace_1.isEnabled()) {
                    trace_1.write("Cleared Return " + returnTransition.getClass().getSimpleName() + " transition for " + fragment, trace_1.categories.Transition);
                }
            }
            if (removeListener) {
                entry.returnTransitionListener = null;
            }
        }
    }
    if (removeListener) {
        var listener = getAnimationListener();
        clearAnimationListener(entry.enterAnimator, listener);
        clearAnimationListener(entry.exitAnimator, listener);
        clearAnimationListener(entry.popEnterAnimator, listener);
        clearAnimationListener(entry.popExitAnimator, listener);
    }
}
function allowTransitionOverlap(fragment) {
    if (fragment) {
        fragment.setAllowEnterTransitionOverlap(true);
        fragment.setAllowReturnTransitionOverlap(true);
    }
}
function setEnterTransition(navigationTransition, entry, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(entry, transition);
    entry.enterTransitionListener = listener;
    var fragment = entry.fragment;
    fragment.setEnterTransition(transition);
}
function setExitTransition(navigationTransition, entry, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(entry, transition);
    entry.exitTransitionListener = listener;
    var fragment = entry.fragment;
    fragment.setExitTransition(transition);
}
function setReenterTransition(navigationTransition, entry, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(entry, transition);
    entry.reenterTransitionListener = listener;
    var fragment = entry.fragment;
    fragment.setReenterTransition(transition);
}
function setReturnTransition(navigationTransition, entry, transition) {
    setUpNativeTransition(navigationTransition, transition);
    var listener = addNativeTransitionListener(entry, transition);
    entry.returnTransitionListener = listener;
    var fragment = entry.fragment;
    fragment.setReturnTransition(transition);
}
function setupNewFragmentSlideTransition(navTransition, entry, name) {
    setupCurrentFragmentSlideTransition(navTransition, entry, name);
    var direction = name.substr("slide".length) || "left";
    switch (direction) {
        case "left":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;
        case "right":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            break;
        case "top":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
        case "bottom":
            setEnterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            setReturnTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            break;
    }
}
function setupCurrentFragmentSlideTransition(navTransition, entry, name) {
    var direction = name.substr("slide".length) || "left";
    switch (direction) {
        case "left":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.LEFT));
            break;
        case "right":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.RIGHT));
            break;
        case "top":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.TOP));
            break;
        case "bottom":
            setExitTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            setReenterTransition(navTransition, entry, new android.transition.Slide(android.view.Gravity.BOTTOM));
            break;
    }
}
function setupNewFragmentFadeTransition(navTransition, entry) {
    setupCurrentFragmentFadeTransition(navTransition, entry);
    var fadeInEnter = new android.transition.Fade(android.transition.Fade.IN);
    setEnterTransition(navTransition, entry, fadeInEnter);
    var fadeOutReturn = new android.transition.Fade(android.transition.Fade.OUT);
    setReturnTransition(navTransition, entry, fadeOutReturn);
}
function setupCurrentFragmentFadeTransition(navTransition, entry) {
    var fadeOutExit = new android.transition.Fade(android.transition.Fade.OUT);
    setExitTransition(navTransition, entry, fadeOutExit);
    var fadeInReenter = new android.transition.Fade(android.transition.Fade.IN);
    setReenterTransition(navTransition, entry, fadeInReenter);
}
function setupCurrentFragmentExplodeTransition(navTransition, entry) {
    setExitTransition(navTransition, entry, new android.transition.Explode());
    setReenterTransition(navTransition, entry, new android.transition.Explode());
}
function setupNewFragmentExplodeTransition(navTransition, entry) {
    setupCurrentFragmentExplodeTransition(navTransition, entry);
    setEnterTransition(navTransition, entry, new android.transition.Explode());
    setReturnTransition(navTransition, entry, new android.transition.Explode());
}
function setupExitAndPopEnterAnimation(entry, transition) {
    var listener = getAnimationListener();
    clearAnimationListener(entry.exitAnimator, listener);
    clearAnimationListener(entry.popEnterAnimator, listener);
    var exitAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.exit);
    exitAnimator.transitionType = transition_1.AndroidTransitionType.exit;
    exitAnimator.entry = entry;
    exitAnimator.addListener(listener);
    entry.exitAnimator = exitAnimator;
    var popEnterAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.popEnter);
    popEnterAnimator.transitionType = transition_1.AndroidTransitionType.popEnter;
    popEnterAnimator.entry = entry;
    popEnterAnimator.addListener(listener);
    entry.popEnterAnimator = popEnterAnimator;
}
function setupAllAnimation(entry, transition) {
    setupExitAndPopEnterAnimation(entry, transition);
    var listener = getAnimationListener();
    var enterAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.enter);
    enterAnimator.transitionType = transition_1.AndroidTransitionType.enter;
    enterAnimator.entry = entry;
    enterAnimator.addListener(listener);
    entry.enterAnimator = enterAnimator;
    var popExitAnimator = transition.createAndroidAnimator(transition_1.AndroidTransitionType.popExit);
    popExitAnimator.transitionType = transition_1.AndroidTransitionType.popExit;
    popExitAnimator.entry = entry;
    popExitAnimator.addListener(listener);
    entry.popExitAnimator = popExitAnimator;
}
function setUpNativeTransition(navigationTransition, nativeTransition) {
    if (navigationTransition.duration) {
        nativeTransition.setDuration(navigationTransition.duration);
    }
    var interpolator = navigationTransition.curve ? animation_1._resolveAnimationCurve(navigationTransition.curve) : defaultInterpolator();
    nativeTransition.setInterpolator(interpolator);
}
function addNativeTransitionListener(entry, nativeTransition) {
    var listener = getTransitionListener(entry, nativeTransition);
    nativeTransition.addListener(listener);
    return listener;
}
function transitionOrAnimationCompleted(fragment) {
    waitingQueue.delete(fragment);
    if (waitingQueue.size === 0) {
        var callbacks = getFragmentCallbacks(fragment);
        var entry = callbacks.entry;
        var frame_1 = callbacks.frame;
        var setAsCurrent_1 = frame_1.isCurrent(entry) ? fragmentCompleted : fragment;
        fragmentCompleted = null;
        if (setAsCurrent_1) {
            setTimeout(function () { return frame_1.setCurrent(getFragmentCallbacks(setAsCurrent_1).entry); });
        }
    }
    else {
        fragmentCompleted = fragment;
    }
}
function toShortString(nativeTransition) {
    return nativeTransition.getClass().getSimpleName() + "@" + nativeTransition.hashCode().toString(16);
}
function javaObjectArray() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var nativeArray = Array.create(java.lang.Object, params.length);
    params.forEach(function (value, i) { return nativeArray[i] = value; });
    return nativeArray;
}
function javaClassArray() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var nativeArray = Array.create(java.lang.Class, params.length);
    params.forEach(function (value, i) { return nativeArray[i] = value; });
    return nativeArray;
}
function initDefaultAnimations(manager) {
    if (reflectionDone) {
        return;
    }
    reflectionDone = true;
    loadAnimatorMethod = manager.getClass().getDeclaredMethod("loadAnimator", javaClassArray(android.app.Fragment.class, java.lang.Integer.TYPE, java.lang.Boolean.TYPE, java.lang.Integer.TYPE));
    if (loadAnimatorMethod != null) {
        loadAnimatorMethod.setAccessible(true);
        var fragment_open = java.lang.Integer.valueOf(android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
        var zero = java.lang.Integer.valueOf(0);
        var fragment = new android.app.Fragment();
        defaultEnterAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.TRUE, zero));
        defaultExitAnimatorStatic = loadAnimatorMethod.invoke(manager, javaObjectArray(fragment, fragment_open, java.lang.Boolean.FALSE, zero));
    }
}
function getDefaultAnimation(enter) {
    var defaultAnimator = enter ? defaultEnterAnimatorStatic : defaultExitAnimatorStatic;
    return defaultAnimator ? defaultAnimator.clone() : null;
}
function createDummyZeroDurationAnimator() {
    var animator = android.animation.ValueAnimator.ofObject(intEvaluator(), javaObjectArray(java.lang.Integer.valueOf(0), java.lang.Integer.valueOf(1)));
    animator.setDuration(0);
    return animator;
}
function printTransitions(entry) {
    if (entry && trace_1.isEnabled()) {
        var fragment = entry.fragment;
        var result = fragment + " Transitions:";
        if (entry.transitionName) {
            result += "transitionName=" + entry.transitionName + ", ";
        }
        if (entry.transition) {
            result += "enterAnimator=" + entry.enterAnimator + ", ";
            result += "exitAnimator=" + entry.exitAnimator + ", ";
            result += "popEnterAnimator=" + entry.popEnterAnimator + ", ";
            result += "popExitAnimator=" + entry.popExitAnimator + ", ";
        }
        if (sdkVersion() >= 21) {
            result += "" + (fragment.getEnterTransition() ? " enter=" + toShortString(fragment.getEnterTransition()) : "");
            result += "" + (fragment.getExitTransition() ? " exit=" + toShortString(fragment.getExitTransition()) : "");
            result += "" + (fragment.getReenterTransition() ? " popEnter=" + toShortString(fragment.getReenterTransition()) : "");
            result += "" + (fragment.getReturnTransition() ? " popExit=" + toShortString(fragment.getReturnTransition()) : "");
        }
        trace_1.write(result, trace_1.categories.Transition);
    }
}
var NoTransition = (function (_super) {
    __extends(NoTransition, _super);
    function NoTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoTransition.prototype.createAndroidAnimator = function (transitionType) {
        return createDummyZeroDurationAnimator();
    };
    return NoTransition;
}(transition_1.Transition));
var DefaultTransition = (function (_super) {
    __extends(DefaultTransition, _super);
    function DefaultTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultTransition.prototype.createAndroidAnimator = function (transitionType) {
        switch (transitionType) {
            case transition_1.AndroidTransitionType.enter:
            case transition_1.AndroidTransitionType.popEnter:
                return getDefaultAnimation(true);
            case transition_1.AndroidTransitionType.popExit:
            case transition_1.AndroidTransitionType.exit:
                return getDefaultAnimation(false);
        }
    };
    return DefaultTransition;
}(transition_1.Transition));
//# sourceMappingURL=fragment.transitions.js.map