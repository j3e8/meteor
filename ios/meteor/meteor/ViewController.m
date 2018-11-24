//
//  ViewController.m
//  meteor
//
//  Created by Jake Jenne on 11/22/18.
//  Copyright © 2018 Jake Jenne. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.

    NSURL *url = [[NSBundle mainBundle] URLForResource:@"index" withExtension:@"html"];
    NSLog(@"%@", [url absoluteString]);
    [_webview loadRequest:[NSURLRequest requestWithURL:url]];
}


@end
