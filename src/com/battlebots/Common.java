package com.battlebots;

import javax.servlet.http.HttpServletRequest;

/**
 * Battle Bots
 * User: James Whitwell
 * Date: 2/11/13
 * Time: 9:02 PM
 */
public class Common {

	public static int getRequestInt(HttpServletRequest request, final String name, final int defaultValue) {
		int value = defaultValue;

		if (request.getParameter(name) != null) {
			value = Integer.parseInt(request.getParameter(name));
		}

		return value;
	}

	public static String getRequestString(HttpServletRequest request, final String name, final String defaultValue) {
		String value = defaultValue;

		if (request.getParameter(name) != null) {
			value = request.getParameter(name);
		}

		return value;
	}
}
